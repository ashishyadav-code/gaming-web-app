import logoImg from '../assets/logo.png';
import heroBannerImg from '../assets/hero_banner.png';
import heroHeaderImg from '../assets/hero_header.png';
import mapBermuda from '../assets/map_bermuda.png';
import mapKalahari from '../assets/map_kalahari.png';
import mapNexterra from '../assets/map_nexterra.png';
import mapAlpine from '../assets/map_alpine.png';
import mapPurgatory from '../assets/map_purgatory.png';
import avatarAsh from '../assets/avatar_ash.png';
import avatarKai from '../assets/avatar_kai.png';
import avatarVex from '../assets/avatar_vex.png';
import avatarZoro from '../assets/avatar_zoro.png';
import avatarHashirama from '../assets/hashirama.jpeg';
import avatarItachi from '../assets/itachi.jpeg';
import avatarTufan from '../assets/tufan.jpeg';
import avatarPandit from '../assets/pandit.jpeg';

export const ASSETS = {
  logo: logoImg,
  heroBanner: heroBannerImg,
  heroHeader: heroHeaderImg,
  maps: {
    BERMUDA: mapBermuda,
    KALAHARI: mapKalahari,
    NEXTERRA: mapNexterra,
    ALPINE: mapAlpine,
    PURGATORY: mapPurgatory,
  },
  avatars: {
    hashirama: avatarHashirama,
    itachi: avatarItachi,
    tufan: avatarTufan,
    pandit: avatarPandit,
    ash: avatarHashirama,
    kai: avatarItachi,
    vex: avatarTufan,
    zoro: avatarPandit,
    default: avatarHashirama,
  },
};

export const getMapImage = (mapName: string = ''): string => {
  const key = mapName.trim().toUpperCase() as keyof typeof ASSETS.maps;
  return ASSETS.maps[key] || ASSETS.maps.BERMUDA;
};

export const getAvatarImage = (key: string = ''): string => {
  return getPlayerAvatar(key);
};

export const getPlayerAvatar = (nameOrRoleOrUrl?: string): string => {
  if (!nameOrRoleOrUrl) return avatarHashirama;
  const s = String(nameOrRoleOrUrl).toUpperCase();

  // 1. HASHIRAMA 777 (Ashish / Sniper / IGL)
  if (s.includes('HASHIRAMA') || s.includes('ASHISH') || s.includes('SNIPER') || s.includes('IGL')) {
    return avatarHashirama;
  }
  // 2. ITACHI 777 (Shashank / Primary Rusher)
  if (s.includes('ITACHI') || s.includes('SHASHANK') || s.includes('PRIMARY')) {
    return avatarItachi;
  }
  // 3. TUUFAN 777 (Priyanshu / Assaulter)
  if (s.includes('TUUFAN') || s.includes('TUFAN') || s.includes('PRIYANSHU') || s.includes('ASSAULTER')) {
    return avatarTufan;
  }
  // 4. PANDIT 777 (Ansh mishra / 2nd Rusher)
  if (s.includes('PANDIT') || s.includes('ANSH') || s.includes('2ND') || s.includes('SECONDARY')) {
    return avatarPandit;
  }

  if (s.includes('HASHIRAMA.JPEG') || s.includes('HASHIRAMA')) return avatarHashirama;
  if (s.includes('ITACHI.JPEG') || s.includes('ITACHI')) return avatarItachi;
  if (s.includes('TUFAN.JPEG') || s.includes('TUFAN')) return avatarTufan;
  if (s.includes('PANDIT.JPEG') || s.includes('PANDIT')) return avatarPandit;

  if (s.startsWith('HTTP') || s.startsWith('DATA:') || s.startsWith('/ASSETS/')) {
    if (s.includes('AVATAR_ASH')) return avatarHashirama;
    if (s.includes('AVATAR_KAI')) return avatarItachi;
    if (s.includes('AVATAR_VEX')) return avatarTufan;
    if (s.includes('AVATAR_ZORO')) return avatarPandit;
    return nameOrRoleOrUrl;
  }

  return avatarHashirama;
};
