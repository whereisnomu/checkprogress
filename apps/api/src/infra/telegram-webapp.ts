import { createHmac, createHash } from 'node:crypto';

export class TelegramWebAppAuthError extends Error {}

const parseInitData = (initData: string) => {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');

  if (!hash) {
    throw new TelegramWebAppAuthError('Telegram initData hash is missing');
  }

  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  return {
    hash,
    params,
    dataCheckString,
  };
};

export const verifyTelegramWebAppInitData = (
  initData: string,
  botToken: string,
) => {
  const { hash, params, dataCheckString } = parseInitData(initData);
  const secretKey = createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  const calculatedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calculatedHash !== hash) {
    throw new TelegramWebAppAuthError('Telegram initData signature is invalid');
  }

  const userRaw = params.get('user');
  const authDate = params.get('auth_date');

  return {
    authDate,
    user: userRaw ? JSON.parse(userRaw) : null,
    initDataHash: createHash('sha256').update(initData).digest('hex'),
  };
};
