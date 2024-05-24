export type ServerErrorResponse = {
    status: number,
    notification: string,
    message: string,
    action: string,
    type: string,
    url: string,
    params: string,
    query: string,
    header: string | object,
    body: string | object
};
