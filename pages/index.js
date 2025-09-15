import html from "../html/indexHtml";

export default function Home() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
