import { getImageAttachment } from "../../lib/attachments";
import { cleanDOM } from "../../lib/cleanDOM";
import { getHtmlDOM } from "../../lib/http";
import { PublicConstructor } from "../../lib/misc";
import { getSectionName, introDomHandle } from "../../lib/rule";
import { log } from "../../log";
import { Book, BookAdditionalMetadate, Chapter } from "../../main";
import { BaseRuleClass } from "../../rules";

interface MkRuleClassOptions {
  bookUrl: string;
  anotherPageUrl: string;
  getBookname: (doc: Document) => string;
  getAuthor: (doc: Document) => string;
  getIntroDom: (doc: Document) => HTMLElement;
  introDomPatch: (introDom: HTMLElement) => HTMLElement;
  getCoverUrl: (doc: Document) => string | null;
  getAList: (doc: Document) => NodeListOf<Element> | Element[];
  getSections?: (doc: Document) => NodeListOf<Element>;
  getName?: (sElem: Element) => string;
  postHook?: (chapter: Chapter) => Chapter | void;
  getContentFromUrl?: (
    chapterUrl: string,
    chapterName: string | null,
    charset: string
  ) => Promise<HTMLElement | null>;
  getContent?: (doc: Document) => HTMLElement | null;
  contentPatch: (content: HTMLElement) => HTMLElement;
  concurrencyLimit?: number;
}
export function mkRuleClass({
  bookUrl,
  anotherPageUrl,
  getBookname,
  getAuthor,
  getIntroDom,
  introDomPatch,
  getCoverUrl,
  getAList,
  getSections,
  getName: _getSectionName,
  postHook,
  getContentFromUrl,
  getContent,
  contentPatch,
  concurrencyLimit,
}: MkRuleClassOptions): PublicConstructor<BaseRuleClass> {
  return class extends BaseRuleClass {
    public constructor() {
      super();
      this.imageMode = "TM";
      if (concurrencyLimit) {
        this.concurrencyLimit = concurrencyLimit;
      }
    }

    public async bookParse() {
      const doc = await getHtmlDOM(anotherPageUrl, this.charset);

      const bookname = getBookname(doc);
      const author = getAuthor(doc);
      const introDom = getIntroDom(doc);
      const [introduction, introductionHTML, introCleanimages] =
        await introDomHandle(introDom, introDomPatch);

      const coverUrl = getCoverUrl(doc);
      const additionalMetadate: BookAdditionalMetadate = {};
      if (coverUrl) {
        getImageAttachment(coverUrl, this.imageMode, "cover-")
          .then((coverClass) => {
            additionalMetadate.cover = coverClass;
          })
          .catch((error) => log.error(error));
      }

      let sections;
      if (typeof getSections === "function") {
        sections = getSections(doc);
      }
      const chapters: Chapter[] = [];
      let chapterNumber = 0;
      let sectionNumber = 0;
      let sectionChapterNumber = 0;
      let sectionName = null;
      let hasSection = false;
      if (
        sections &&
        sections instanceof NodeList &&
        typeof _getSectionName === "function"
      ) {
        hasSection = true;
      }

      const aList = getAList(doc);
      for (const aElem of Array.from(aList) as HTMLAnchorElement[]) {
        const chapterName = aElem.innerText;
        const chapterUrl = aElem.href;
        if (hasSection) {
          const _sectionName = getSectionName(
            aElem,
            sections as never,
            _getSectionName as never
          );
          if (_sectionName !== sectionName) {
            sectionName = _sectionName;
            sectionNumber++;
            sectionChapterNumber = 0;
          }
        }
        chapterNumber++;
        sectionChapterNumber++;
        const isVIP = false;
        const isPaid = false;
        let chapter: Chapter | void = new Chapter(
          bookUrl,
          bookname,
          chapterUrl,
          chapterNumber,
          chapterName,
          isVIP,
          isPaid,
          sectionName,
          hasSection ? sectionNumber : null,
          hasSection ? sectionChapterNumber : null,
          this.chapterParse,
          this.charset,
          { bookname }
        );
        if (typeof postHook === "function") {
          chapter = postHook(chapter);
        }
        if (chapter) {
          chapters.push(chapter);
        }
      }

      const book = new Book(
        bookUrl,
        bookname,
        author,
        introduction,
        introductionHTML,
        additionalMetadate,
        chapters
      );
      return book;
    }
    public async chapterParse(
      chapterUrl: string,
      chapterName: string | null,
      isVIP: boolean,
      isPaid: boolean,
      charset: string,
      options: object
    ) {
      let content;
      if (getContentFromUrl !== undefined) {
        content = await getContentFromUrl(chapterUrl, chapterName, charset);
      } else if (getContent !== undefined) {
        const doc = await getHtmlDOM(chapterUrl, charset);
        content = getContent(doc);
      }
      if (content) {
        content = contentPatch(content);
        const { dom, text, images } = await cleanDOM(content, "TM");
        return {
          chapterName,
          contentRaw: content,
          contentText: text,
          contentHTML: dom,
          contentImages: images,
          additionalMetadate: null,
        };
      }
      return {
        chapterName,
        contentRaw: null,
        contentText: null,
        contentHTML: null,
        contentImages: null,
        additionalMetadate: null,
      };
    }
  };
}