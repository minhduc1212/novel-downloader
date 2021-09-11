import { attachmentClass } from "../../main";
import { BaseRuleClass } from "../../rules";
import { PublicConstructor } from "../../lib/misc";
export declare function introDomHandle(introDom: (Element | HTMLElement) | null, domPatch?: ((introDom: HTMLElement) => HTMLElement) | undefined): Promise<[string | null, HTMLElement | null, attachmentClass[] | null]>;
export declare function nextPageParse(chapterName: string | null, chapterUrl: string, charset: string, selector: string, contentPatch: (_content: HTMLElement, doc: Document) => HTMLElement, getNextPage: (doc: Document) => string, continueCondition: (_content: HTMLElement, nextLink: string) => boolean): Promise<{
    chapterName: string | null;
    contentRaw: HTMLDivElement;
    contentText: string;
    contentHTML: HTMLElement;
    contentImages: attachmentClass[];
    additionalMetadate: null;
}>;
interface mkRuleClassOptions1 {
    bookUrl: string;
    bookname: string;
    author: string;
    introDom: HTMLElement;
    introDomPatch: (introDom: HTMLElement) => HTMLElement;
    coverUrl: string | null;
    cos: NodeListOf<Element>;
    getContent: (doc: Document) => HTMLElement;
    contentPatch: (content: HTMLElement) => HTMLElement;
}
export declare function mkRuleClass1(optionis: mkRuleClassOptions1): PublicConstructor<BaseRuleClass>;
export {};
