import type { Metadata } from "next";
import { RootProvider } from "fumadocs-ui/provider/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DOE UI",
  description: "面向 DOE 应用的 AI-readable UI 与 Domain 基础设施。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <RootProvider
          i18n={{
            locale: "zh-CN",
            translations: {
              "Search(search trigger)": "搜索",
              "Search(search dialog)": "搜索文档",
              "Open Search(search trigger)(aria-label)": "打开搜索",
              "Close Search(search dialog)(aria-label)": "关闭搜索",
              "No results found(search dialog)": "没有找到结果",
              "On this page(table of contents)": "本页目录",
              "Next Page(pagination)": "下一页",
              "Previous Page(pagination)": "上一页",
              "Light(theme switcher)(aria-label)": "浅色模式",
              "Dark(theme switcher)(aria-label)": "深色模式",
              "System(theme switcher)(aria-label)": "跟随系统",
              "Toggle Theme(theme switcher)(aria-label)": "切换主题",
              "Open Sidebar(sidebar)(aria-label)": "打开侧边栏",
              "Close Sidebar(sidebar)(aria-label)": "关闭侧边栏",
              "Collapse Sidebar(sidebar)(aria-label)": "折叠侧边栏",
              "Show Sidebar(sidebar)": "显示侧边栏",
              "Hide Sidebar(sidebar)": "隐藏侧边栏",
              "Copy Text(code block)(aria-label)": "复制代码",
              "Copied Text(code block)(aria-label)": "已复制",
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
