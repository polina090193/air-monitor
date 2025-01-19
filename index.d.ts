declare interface WorldCO2DataRow {
    date: string;
    domestic_aviation: number;
    ground_transport: number;
    industry: number;
    international_aviation: number;
    power: number;
    residential: number;
    total: number;
}

declare interface WorldCO2DataDay {
    date: Date;
    total: number;
}

declare interface WorldCO2DataYear {
    year: number;
    data: WorldCO2DataDay[]
}
