declare interface WorldDataRow {
    date: string;
    domestic_aviation: number;
    ground_transport: number;
    industry: number;
    international_aviation: number;
    power: number;
    residential: number;
    total: number;
}

declare interface WorldDataDay {
    date: Date;
    total: number;
}
