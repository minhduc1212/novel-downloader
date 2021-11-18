import { Book } from "../main";
import { BaseRuleClass, ChapterParseObject } from "../rules";
export declare class Zongheng extends BaseRuleClass {
    constructor();
    bookParse(): Promise<Book>;
    chapterParse(chapterUrl: string, chapterName: string | null, isVIP: boolean, isPaid: boolean, charset: string, options: object): Promise<ChapterParseObject>;
}
