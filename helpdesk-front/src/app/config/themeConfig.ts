import {Theme} from "../components/enum/tema";

export class ThemeConfig {
    private static readonly themeFiles: Record<Theme, string> = {
        [Theme.DEEP_PURPLE_AMBER]: 'deeppurple-amber.css',
        [Theme.INDIGO_PINK]: 'indigo-pink.css',
        [Theme.PINK_BLUEGREY]: 'pink-bluegrey.css',
        [Theme.PURPLE_GREEN]: 'purple-green.css',
    };

    static getThemeFileName(theme: Theme): string | undefined {
        return ThemeConfig.themeFiles[theme];
    }
}
