const INTRO_STORAGE_KEY = "mnemos_intro_done";

export function introAlreadyShown(): boolean {
  return sessionStorage.getItem(INTRO_STORAGE_KEY) === "true";
}

export function markIntroShown(): void {
  sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
}

export function clearIntroFlag(): void {
  sessionStorage.removeItem(INTRO_STORAGE_KEY);
}