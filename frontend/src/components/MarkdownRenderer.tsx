import React from "react";
import { View, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";
import { WebView } from "react-native-webview";
import { useThemeColors } from "../theme/colors";

interface Props {
  content: string;
}

const MermaidRenderer: React.FC<{ chart: string }> = ({ chart }) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <script>
          mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
          });
        </script>
        <style>
          body { margin: 0; display: flex; justify-content: center; }
          .mermaid { width: 100%; }
        </style>
      </head>
      <body>
        <div class="mermaid">
          ${chart}
        </div>
      </body>
    </html>
  `;

  return (
    <View style={styles.mermaidContainer}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        onMessage={(event) => {
          console.log("Mermaid rendered:", event.nativeEvent.data);
        }}
      />
    </View>
  );
};

const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  const colors = useThemeColors();
  const [mermaidCharts, setMermaidCharts] = React.useState<string[]>([]);
  const [processedContent, setProcessedContent] = React.useState(content);

  React.useEffect(() => {
    // Mermaid 코드 블록 추출
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    const charts: string[] = [];
    let newContent = content.replace(mermaidRegex, (_, chart) => {
      charts.push(chart.trim());
      return `[MERMAID_CHART_${charts.length - 1}]`;
    });

    // 테이블 형식 전처리
    const tableRegex = /\|(.*)\|\n\|[-:\s|]*\|\n((?:\|.*\|\n)*)/g;
    newContent = newContent.replace(tableRegex, (match) => {
      // 줄바꿈을 기준으로 행을 분리
      const rows = match.split("\n").filter((row) => row.trim());

      // 각 행의 열 구분자(|) 정리
      const processedRows = rows.map((row) => {
        // 앞뒤 공백과 열 구분자 정리
        let processedRow = row.trim().replace(/^\||\|$/g, "");
        // 열 내용의 앞뒤 공백 정리
        processedRow = processedRow
          .split("|")
          .map((cell) => cell.trim())
          .join(" | ");
        return `| ${processedRow} |`;
      });

      // 헤더 행과 구분자 행이 없는 경우 추가
      if (processedRows.length === 1) {
        const columnCount = processedRows[0].split("|").length - 2; // 실제 열 수
        const headerRow =
          "| " + Array(columnCount).fill("항목").join(" | ") + " |";
        const separatorRow =
          "| " + Array(columnCount).fill("---").join(" | ") + " |";
        return `${headerRow}\n${separatorRow}\n${processedRows[0]}\n`;
      }

      // 구분자 행이 없는 경우 추가
      if (processedRows.length > 1 && !processedRows[1].includes("-")) {
        const columnCount = processedRows[0].split("|").length - 2;
        const separatorRow =
          "| " + Array(columnCount).fill("---").join(" | ") + " |";
        return (
          processedRows[0] +
          "\n" +
          separatorRow +
          "\n" +
          processedRows.slice(1).join("\n") +
          "\n"
        );
      }

      return processedRows.join("\n") + "\n";
    });

    setMermaidCharts(charts);
    setProcessedContent(newContent);
  }, [content]);

  const renderContent = (text: string) => {
    const parts = text.split(/(\[MERMAID_CHART_\d+\])/);
    return parts.map((part, index) => {
      const match = part.match(/\[MERMAID_CHART_(\d+)\]/);
      if (match) {
        const chartIndex = parseInt(match[1], 10);
        return (
          <MermaidRenderer
            key={`mermaid-${chartIndex}`}
            chart={mermaidCharts[chartIndex]}
          />
        );
      }
      return (
        <Markdown
          key={`md-${index}`}
          style={{
            body: { color: colors.textPrimary },
            heading1: { color: colors.textPrimary },
            heading2: { color: colors.textPrimary },
            heading3: { color: colors.textPrimary },
            heading4: { color: colors.textPrimary },
            heading5: { color: colors.textPrimary },
            heading6: { color: colors.textPrimary },
            paragraph: { color: colors.textPrimary },
            link: { color: colors.accent },
            list_item: { color: colors.textPrimary },
            blockquote: {
              backgroundColor: colors.cardBackground,
              borderColor: colors.accent,
            },
            code_block: {
              backgroundColor: colors.cardBackground,
              padding: 10,
              borderRadius: 8,
            },
            code_inline: {
              backgroundColor: colors.cardBackground,
              padding: 4,
              borderRadius: 4,
            },
            table: {
              borderWidth: 1,
              borderColor: colors.border,
              marginVertical: 10,
              width: "100%",
            },
            thead: {
              backgroundColor: colors.cardBackground,
              borderBottomWidth: 1,
              borderColor: colors.border,
            },
            th: {
              padding: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.cardBackground,
            },
            tbody: {
              borderWidth: 1,
              borderColor: colors.border,
            },
            tr: {
              borderBottomWidth: 1,
              borderColor: colors.border,
            },
            td: {
              padding: 8,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          }}
        >
          {part}
        </Markdown>
      );
    });
  };

  return (
    <View style={styles.container}>{renderContent(processedContent)}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  mermaidContainer: {
    height: 300,
    marginVertical: 10,
  },
  webview: {
    backgroundColor: "transparent",
  },
});

export default MarkdownRenderer;
