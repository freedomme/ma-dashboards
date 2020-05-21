/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

maThemingFactory.$inject = ['$mdTheming'];
function maThemingFactory($mdTheming) {
    
    const paletteNames = ['primary', 'accent', 'warn', 'background'];
    const hueNames = ['default', 'hue-1', 'hue-2', 'hue-3', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'A100', 'A200', 'A400', 'A700'];
    const foregroundHues = ['1', '2', '3', '4'];
    
    const allHues = paletteNames.map(palette => {
        return hueNames.map(hue => {
            return {
                palette,
                hue,
                colorString: hue === 'default' ? palette : `${palette}-${hue}`
            };
        });
    }).reduce((acc, h) => {
        return acc.concat(h);
    });
    
    class ThemeService {
        
        getThemeColor(options) {
            let {theme, palette, hue} = options;

            const scheme = $mdTheming.THEMES[theme].colors[palette];
            if (scheme.hues[hue]) {
                hue = scheme.hues[hue];
            }
            const paletteObj = $mdTheming.PALETTES[scheme.name];
            return paletteObj[hue];
        }
        
        getCssVariables(theme) {
            const properties = [];
            
            allHues.map(x => {
                const color = this.getThemeColor(Object.assign({theme}, x));
                return Object.assign({}, color, x);
            }).forEach(color => {
                const value = color.value.join(',');
                const contrast = color.contrast.join(',');
                properties.push({name: `--ma-${color.colorString}`, value: `rgb(${value})`});
                properties.push({name: `--ma-${color.colorString}-contrast`, value: `rgba(${contrast})`});
                properties.push({name: `--ma-${color.colorString}-value`, value: value});
            });
            
            foregroundHues.forEach(hue => {
                properties.push({name: `--ma-foreground-${hue}`, value: $mdTheming.THEMES[theme].foregroundPalette[hue]});
            });
            properties.push({name: '--ma-foreground-value', value: $mdTheming.THEMES[theme].isDark ? '255,255,255' : '0,0,0'});
            
            return properties;
        }
        
        themeElement(element, theme) {
            if (theme) {
                const properties = this.getCssVariables(theme);
                properties.forEach(property => {
                    element.style.setProperty(property.name, property.value);
                });
            } else {
                // remove theme
                element.style.removeProperty('--ma-font-default');
                element.style.removeProperty('--ma-font-paragraph');
                element.style.removeProperty('--ma-font-heading');
                element.style.removeProperty('--ma-font-code');
                allHues.forEach(x => {
                    element.style.removeProperty(`--ma-${x.colorString}`);
                    element.style.removeProperty(`--ma-${x.colorString}-contrast`);
                    element.style.removeProperty(`--ma-${x.colorString}-value`);
                });
                foregroundHues.forEach(hue => {
                    element.style.removeProperty(`--ma-foreground-${hue}`);
                });
                element.style.removeProperty(`--ma-foreground-value`);
            }
            this.setThemeClasses(element, theme);
        }

        setThemeClasses(element, theme) {
            element.classList.remove('ma-theme-dark');
            element.classList.remove('ma-theme-light');
            if (theme) {
                const themeObj = $mdTheming.THEMES[theme];
                element.classList.add(themeObj.isDark ? 'ma-theme-dark' : 'ma-theme-light');
            }
        }
        
        getPaletteNames() {
            return paletteNames;
        }
        
        getHueNames() {
            return hueNames;
        }
        
        getThemes() {
            return $mdTheming.THEMES;
        }
        
        getPalettes() {
            return $mdTheming.PALETTES;
        }
    }
    
    return new ThemeService();
}

export default maThemingFactory;