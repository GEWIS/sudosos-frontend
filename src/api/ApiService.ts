import { AuthenticateApi, BalanceApi, Configuration } from 'sudosos-client';

class ApiService {
  private readonly authenticateApi: AuthenticateApi;

  private readonly balanceApi: BalanceApi;

  private jwtToken: string | undefined;

  constructor() {
    const configuration = new Configuration({ basePath: process.env.VUE_APP_API_BASE });
    const withKeyConfiguration = new Configuration({
      basePath: process.env.VUE_APP_API_BASE,
      apiKey: () => `Bearer ${this.jwtToken}`,
    });

    this.authenticateApi = new AuthenticateApi(configuration);
    this.balanceApi = new BalanceApi(withKeyConfiguration);
  }

  get authenticate() {
    return this.authenticateApi;
  }

  get balance() {
    return this.balanceApi;
  }

  setJwtToken(jwtToken: string | undefined) {
    this.jwtToken = jwtToken;
  }
}

export default new ApiService();
