export interface DbScheduleRow {
    No: string | number;
    Status: string;
    SourceNo: string | null;
    RoutingNo: string | null;
    StartingDate: Date | null;
    EndingDate: Date | null;
    DueDate: Date | null;
    LocationCode: string;
    Remark: string | null;
    DemandSourceID: string | null;
    OrderDate: Date | null;
    LeadTimeDays: number | null;
    Quantity: number | null;
    ItemDescription: string | null;
    CreationDate: Date | null;
    LastDateModified: Date | null;
}

export interface JobItem {
    no: string;
    status: string;
    sourceNo: string;
    routingNo: string;
    startingDate: string;
    endingDate: string;
    dueDate: string;
    locationCode: string;
    remark: string;
    demandSourceID: string;
    orderDate: string;
    leadTimeDays: number | null;
    quantity: number | null;
    itemDescription: string;
    creationDate: string;
    lastDateModified: string;
    overdueDays?: number;
}

export interface JobCategory {
    overdue: JobItem[];
    today: JobItem[];
    tomorrow: JobItem[];
}

export interface DashboardData {
    relabelFilling: JobCategory;
    mixing: JobCategory;
    lastUpdated: string;
}
