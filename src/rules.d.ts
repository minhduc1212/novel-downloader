import { AttachmentClass, Book, Chapter, ChapterAdditionalMetadate } from "./main";
import { SaveBook, SaveOptions } from "./save/save";
export interface ChapterParseObject {
    chapterName: string | null;
    contentRaw: HTMLElement | null;
    contentText: string | null;
    contentHTML: HTMLElement | null;
    contentImages: AttachmentClass[] | null;
    additionalMetadate: ChapterAdditionalMetadate | null;
}
export declare abstract class BaseRuleClass {
    imageMode: "naive" | "TM";
    charset: string;
    concurrencyLimit: number;
    maxRunLimit?: number;
    saveOptions?: SaveOptions;
    streamZip: boolean;
    book?: Book;
    private audio?;
    private bcWorker;
    private bcWorkerMessages;
    constructor();
    abstract bookParse(): Promise<Book>;
    abstract chapterParse(chapterUrl: string, chapterName: string | null, isVIP: boolean, isPaid: boolean | null, charset: string, options: object): Promise<ChapterParseObject>;
    run(): Promise<Book | undefined>;
    protected preHook(): Promise<void>;
    protected initChapters(book: Book, saveBookObj: SaveBook): Promise<Chapter[]>;
    protected postHook(): void;
    protected catchError(error: Error): void;
}