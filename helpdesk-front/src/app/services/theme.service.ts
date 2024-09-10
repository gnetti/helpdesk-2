import {Injectable} from '@angular/core';
import {ThemeConfig} from "../config/themeConfig";
import {Theme} from "../components/enum/tema";


@Injectable({
    providedIn: 'root',
})
export class ThemeService {

    private themeLinkElement: HTMLLinkElement;

    constructor() {
        this.themeLinkElement = this.createOrGetThemeLinkElement();
        this.loadSavedTheme();
    }

    setTheme(theme: Theme) {
        const themeFileName = ThemeConfig.getThemeFileName(theme);
        if (themeFileName) {
            this.themeLinkElement.href = `assets/theme/${themeFileName}`;
            sessionStorage.setItem('theme', theme);
        } else {
        }
    }

    getCurrentTheme(): Theme {
        return sessionStorage.getItem('theme') as Theme || Theme.INDIGO_PINK;
    }

    private createOrGetThemeLinkElement(): HTMLLinkElement {
        let themeLink = document.querySelector('link[data-theme="true"]') as HTMLLinkElement;
        if (!themeLink) {
            themeLink = document.createElement('link');
            themeLink.rel = 'stylesheet';
            themeLink.dataset.theme = 'true';
            document.head.appendChild(themeLink);
        }
        return themeLink;
    }

    private loadSavedTheme() {
        const savedTheme = this.getCurrentTheme();
        this.setTheme(savedTheme);
    }
}
