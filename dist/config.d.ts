export declare const initConfig: (configPath?: string) => Promise<void>;
export declare const getConfig: (cfg?: Object) => {
    app: {
        port: number;
        configPath: string;
        koaBody: {
            multipart: boolean;
        };
        enableLog: boolean;
        log_info_filename: string;
        log_error_filename: string;
        log_error_pattern: string;
        route_path: string;
        controller_path: string;
        middleware_path: string;
        view_path: string;
        static_path: string;
        validate_path: string;
        utils_path: string;
        model_path: string;
        jwt_key: string;
        expiresIn: number;
        sqlDebug: boolean;
        createTime: string;
        updateTime: string;
        deleteTime: string;
    };
    ws: {
        enable: boolean;
        port: number;
        websocket_path: string;
    };
} & Record<string, any> & Object;
