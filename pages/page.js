import html from "../html/pageHtml";

export default function Page() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
