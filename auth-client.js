"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthClient = void 0;
const crypto = require("crypto");
const login_access_data_struct_1 = require("../talk/struct/auth/login-access-data-struct");
const web_api_struct_1 = require("../talk/struct/web-api-struct");
const api_header_decorator_1 = require("./api-header-decorator");
const web_api_client_1 = require("./web-api-client");
class AuthClient extends web_api_client_1.WebApiClient {
    constructor(name, deviceUUID, configProvider) {
        super(configProvider);
        this.aHeader = new api_header_decorator_1.AHeaderDecorator(configProvider);
        this.name = name;
        this.deviceUUID = deviceUUID;
        this.currentLogin = null;
        this.accessData = null;
    }
    get AHeader() {
        return this.aHeader;
    }
    get Scheme() {
        return 'https';
    }
    get Host() {
        return 'katalk.kakao.com';
    }
    get Agent() {
        return this.ConfigProvider.Configuration.agent;
    }
    fillHeader(header) {
        super.fillHeader(header);
        this.aHeader.fillHeader(header);
        if (this.accessData)
            this.fillSessionHeader(header);
    }
    get Name() {
        return this.name;
    }
    get DeviceUUID() {
        return this.deviceUUID;
    }
    set DeviceUUID(uuid) {
        this.deviceUUID = uuid;
    }
    get Logon() {
        return this.accessData !== null;
    }
    async requestMoreSettings(since = 0, language = this.ConfigProvider.Configuration.language) {
        return this.request('GET', `${AuthClient.getAccountApiPath(this.Agent, 'more_settings.json')}?since=${encodeURIComponent(since)}&lang=${encodeURIComponent(language)}`);
    }
    async requestLessSettings(since = 0, language = this.ConfigProvider.Configuration.language) {
        return this.request('GET', `${AuthClient.getAccountApiPath(this.Agent, 'less_settings.json')}?since=${encodeURIComponent(since)}&lang=${encodeURIComponent(language)}`);
    }
    async updateSettings(settings) {
        return this.request('POST', AuthClient.getAccountApiPath(this.Agent, 'update_settings.json'), settings);
    }
    async requestWebLoginToken() {
        return this.request('GET', AuthClient.getAccountApiPath(this.Agent, 'login_token.json'));
    }
    createSessionURL(token, redirectURL) {
        return `https://accounts.kakao.com/weblogin/login_redirect?continue=${encodeURIComponent(redirectURL)}&token=${token}`;
    }
    async requestSessionURL(redirectURL) {
        let res = await this.requestWebLoginToken();
        if (res.status !== web_api_struct_1.WebApiStatusCode.SUCCESS)
            throw new Error('Cannot request login token');
        return this.createSessionURL(res.token, redirectURL);
    }
    createLoginForm(email, password, permanent, forced) {
        let form = {
            'email': email,
            'password': password,
            'device_uuid': this.deviceUUID,
            'os_version': this.ConfigProvider.Configuration.osVersion,
            'device_name': this.name
        };
        if (typeof (permanent) === 'boolean')
            form['permanent'] = permanent;
        if (typeof (forced) === 'boolean')
            form['forced'] = forced;
        return form;
    }
    createAutologinForm(email, token, locked, permanent, forced) {
        let form = this.createLoginForm(email, token, permanent, forced);
        form['auto_login'] = true;
        form['autowithlock'] = locked;
        return form;
    }
    createRegisterForm(passcode, email, password, permanent, forced) {
        let form = this.createLoginForm(email, password, permanent, forced);
        form['passcode'] = passcode;
        return form;
    }
    async login(email, password, forced = false) {
        this.accessData = null;
        this.currentLogin = this.login.bind(this, email, password, forced);
        let form = this.createLoginForm(email, password, undefined, forced);
        let xvc = this.calculateXVCKey(this.BasicHeader.UserAgent, email);
        this.loginAccessData(await this.requestMapped('POST', AuthClient.getAccountApiPath(this.Agent, 'login.json'), login_access_data_struct_1.LoginAccessDataStruct.MAPPER, form, { 'X-VC': xvc }));
    }
    async loginToken(email, token, forced = false, locked = true) {
        this.accessData = null;
        this.currentLogin = this.loginToken.bind(this, email, token, forced);
        let form = this.createAutologinForm(email, token, locked, undefined, forced);
        let xvc = this.calculateXVCKey(this.BasicHeader.UserAgent, email);
        this.loginAccessData(await this.requestMapped('POST', AuthClient.getAccountApiPath(this.Agent, 'login.json'), login_access_data_struct_1.LoginAccessDataStruct.MAPPER, form, { 'X-VC': xvc }));
    }
    loginAccessData(accessData) {
        if (accessData.status !== web_api_struct_1.WebApiStatusCode.SUCCESS) {
            throw accessData;
        }
        this.accessData = accessData;
    }
    async requestPasscode(email, password, permanent, forced = false) {
        let form = this.createLoginForm(email, password, permanent, forced);
        let xvc = this.calculateXVCKey(this.BasicHeader.UserAgent, email);
        return this.request('POST', AuthClient.getAccountApiPath(this.Agent, 'request_passcode.json'), form, { 'X-VC': xvc });
    }
    async registerDevice(passcode, email, password, permanent, forced = false) {
        let form = this.createRegisterForm(passcode, email, password, permanent, forced);
        let xvc = this.calculateXVCKey(this.BasicHeader.UserAgent, email);
        return this.request('POST', AuthClient.getAccountApiPath(this.Agent, 'register_device.json'), form, { 'X-VC': xvc });
    }
    async relogin() {
        if (!this.currentLogin)
            throw new Error('Login data does not exist');
        return this.currentLogin();
    }
    static getAccountApiPath(agent, api) {
        return `${agent}/account/${api}`;
    }
    calculateXVCKey(userAgent, email) {
        return this.calculateFullXVCKey(userAgent, email).substring(0, 16);
    }
    calculateFullXVCKey(userAgent, email) {
        let config = this.ConfigProvider.Configuration;
        let source = `${config.xvcSeedList[0]}|${userAgent}|${config.xvcSeedList[1]}|${email}|${this.deviceUUID}`;
        let hash = crypto.createHash('sha512');
        hash.update(source);
        return hash.digest('hex');
    }
    generateAutoLoginToken() {
        let accessData = this.getLatestAccessData();
        let config = this.ConfigProvider.Configuration;
        let source = `${config.loginTokenSeedList[0]}|${accessData.autoLoginEmail}|${accessData.refreshToken}|${this.deviceUUID}|${config.loginTokenSeedList[1]}`;
        let hash = crypto.createHash('sha512');
        hash.update(source);
        return hash.digest('hex');
    }
    logout() {
        this.currentLogin = null;
        this.accessData = null;
    }
    getLatestAccessData() {
        if (!this.accessData)
            throw new Error('Not logon');
        return this.accessData;
    }
    fillSessionHeader(header) {
        header['Authorization'] = `${this.getLatestAccessData().accessToken}-${this.deviceUUID}`;
    }
}
exports.AuthClient = AuthClient;
//# sourceMappingURL=auth-client.js.map
