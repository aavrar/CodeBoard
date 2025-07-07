import { google } from 'googleapis'
import { AuthProvider, UserTier, OAuthProfile, OAuthTokens } from '../types/index'

interface OAuthConfig {
  google: {
    clientId: string
    clientSecret: string
    redirectUri: string
  }
  github: {
    clientId: string
    clientSecret: string
    redirectUri: string
  }
}

class OAuthService {
  private config: OAuthConfig

  constructor() {
    this.config = {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: process.env.GOOGLE_REDIRECT_URI || `http://localhost:3001/api/oauth/google/callback`
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        redirectUri: process.env.GITHUB_REDIRECT_URI || `http://localhost:3001/api/oauth/github/callback`
      }
    }
  }

  generateGoogleAuthUrl(): string {
    if (!this.config.google.clientId || this.config.google.clientId === 'your-google-client-id-here') {
      throw new Error('Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.')
    }

    const oauth2Client = new google.auth.OAuth2(
      this.config.google.clientId,
      this.config.google.clientSecret,
      this.config.google.redirectUri
    )

    const scopes = ['openid', 'email', 'profile']
    
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      state: this.generateState()
    })
  }

  generateGitHubAuthUrl(): string {
    if (!this.config.github.clientId || this.config.github.clientId === 'your-github-client-id-here') {
      throw new Error('GitHub OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.')
    }

    const params = new URLSearchParams({
      client_id: this.config.github.clientId,
      redirect_uri: this.config.github.redirectUri,
      scope: 'user:email',
      state: this.generateState()
    })

    return `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  async exchangeGoogleCode(code: string): Promise<{ tokens: OAuthTokens; profile: OAuthProfile }> {
    const oauth2Client = new google.auth.OAuth2(
      this.config.google.clientId,
      this.config.google.clientSecret,
      this.config.google.redirectUri
    )

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data } = await oauth2.userinfo.get()

    const profile: OAuthProfile = {
      id: data.id || '',
      email: data.email || '',
      name: data.name || undefined,
      picture: data.picture || undefined,
      verified_email: data.verified_email || undefined
    }

    const oauthTokens: OAuthTokens = {
      access_token: tokens.access_token || '',
      refresh_token: tokens.refresh_token || undefined,
      expires_in: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : undefined,
      token_type: tokens.token_type || 'Bearer'
    }

    return { tokens: oauthTokens, profile }
  }

  async exchangeGitHubCode(code: string): Promise<{ tokens: OAuthTokens; profile: OAuthProfile }> {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: this.config.github.clientId,
        client_secret: this.config.github.clientSecret,
        code
      })
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new Error(`GitHub OAuth error: ${tokenData.error_description}`)
    }

    const accessToken = tokenData.access_token

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'CodeBoard-App'
      }
    })

    const userData = await userResponse.json()

    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'CodeBoard-App'
      }
    })

    const emailsData = await emailsResponse.json()
    const primaryEmail = emailsData.find((email: any) => email.primary)?.email || userData.email

    const profile: OAuthProfile = {
      id: userData.id.toString(),
      email: primaryEmail,
      name: userData.name || userData.login || undefined,
      picture: userData.avatar_url || undefined,
      verified_email: true
    }

    const tokens: OAuthTokens = {
      access_token: accessToken,
      token_type: tokenData.token_type || 'bearer'
    }

    return { tokens, profile }
  }

  detectUserTier(email: string): UserTier {
    if (!email) return UserTier.COMMUNITY

    const emailDomain = email.toLowerCase().split('@')[1]
    
    if (this.isEducationalDomain(emailDomain)) {
      return UserTier.RESEARCHER
    }

    return UserTier.COMMUNITY
  }

  private isEducationalDomain(domain: string): boolean {
    const educationalDomains = [
      '.edu',
      '.ac.uk',
      '.edu.au',
      '.ac.nz',
      '.edu.sg',
      '.ac.za',
      '.edu.my',
      '.ac.in',
      '.edu.pk',
      '.ac.jp',
      '.edu.hk',
      '.ac.kr',
      '.edu.tw',
      '.ac.th',
      '.edu.ph',
      '.ac.id',
      '.edu.vn',
      '.ac.cn',
      '.edu.br',
      '.ac.il',
      '.edu.eg',
      '.ac.ma',
      '.edu.mx',
      '.ac.cr',
      '.edu.ar',
      '.ac.cl',
      '.edu.co',
      '.ac.pe',
      '.edu.ec',
      '.ac.bo',
      '.edu.py',
      '.ac.uy',
      '.edu.ve'
    ]

    return educationalDomains.some(suffix => domain.endsWith(suffix))
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  validateState(providedState: string, sessionState: string): boolean {
    return providedState === sessionState
  }
}

export const oauthService = new OAuthService()