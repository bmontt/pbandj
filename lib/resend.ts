import { Resend } from "resend"

let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable")
    }

    resendInstance = new Resend(apiKey)
  }

  return resendInstance
}

export const resend = {
  get emails() {
    return getResend().emails
  },
  get contacts() {
    return getResend().contacts
  },
  get audiences() {
    return getResend().audiences
  },
  get domains() {
    return getResend().domains
  },
  get apiKeys() {
    return getResend().apiKeys
  }
}
