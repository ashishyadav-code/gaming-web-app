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
    ash: avatarAsh,
    kai: avatarKai,
    vex: avatarVex,
    zoro: avatarZoro,
    default: avatarAsh,
  }
};

export const getMapImage = (mapName: string = ''): string => {
  const key = mapName.trim().toUpperCase() as keyof typeof ASSETS.maps;
  return ASSETS.maps[key] || ASSETS.maps.BERMUDA;
};

export const getAvatarImage = (key: string = ''): string => {
  const k = key.toLowerCase() as keyof typeof ASSETS.avatars;
  return ASSETS.avatars[k] || ASSETS.avatars.default;
};
