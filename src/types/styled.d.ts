import { pyxisTheme } from 'src/theme/styledComponentsTheme'
import 'styled-components'

type CustomTheme = typeof pyxisTheme

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends CustomTheme {}
}
