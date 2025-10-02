// theme/chakra-theme.ts
import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const colors = {
  pastel: {
    rose: {
      50:  '#FFF6F7',
      100: '#FFE9EC',
      200: '#FFD3D9',
      300: '#FFB9C3',
      400: '#FF9EAD',
      500: '#F07C91',
      600: '#D9647B',
      700: '#B64B61',
      800: '#8C384A',
      900: '#6B2B39',
    },
    sky: {
      50:  '#F2FAFF',
      100: '#DDF3FF',
      200: '#BEE8FF',
      300: '#9EDBFF',
      400: '#7FCDFF',
      500: '#5AB8F2',
      600: '#3C96CE',
      700: '#2E76A4',
      800: '#235A7E',
      900: '#1B4460',
    },
    lavender: {
      50:  '#F6F4FF',
      100: '#ECE9FF',
      200: '#DAD5FF',
      300: '#C0B7FF',
      400: '#A493FF',
      500: '#8A77F0',
      600: '#6F5ED1',
      700: '#5749A8',
      800: '#423782',
      900: '#342A65',
    },
    mint: {
      50:  '#EEFFF6',
      100: '#D7FFE9',
      200: '#B6F8D2',
      300: '#93EDBB',
      400: '#6FDE9F',
      500: '#4FCA84',
      600: '#39A868',
      700: '#2C8251',
      800: '#22633F',
      900: '#1B4C31',
    },
    peach: {
      50:  '#FFF6F0',
      100: '#FFE9DB',
      200: '#FFD2B6',
      300: '#FFB98F',
      400: '#FFA370',
      500: '#F5854B',
      600: '#D56B34',
      700: '#A95028',
      800: '#823F21',
      900: '#643118',
    },
  },
}

const shadows = {
  'elevation-1': '0 6px 20px rgba(16, 24, 40, 0.06)',
  'elevation-2': '0 10px 30px rgba(16, 24, 40, 0.08)',
}

const radii = {
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
}

const fonts = {
  heading: `'Zalando Sans', ui-sans-serif, system-ui`,
  body: `'Zalando Sans', ui-sans-serif, system-ui`,
}

const theme = extendTheme({
  config,
  colors,
  shadows,
  radii,
  fonts,
  styles: {
    global: {
      body: { bg: '#FAF7F4' },
    },
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          borderRadius: '3xl',
          boxShadow: 'elevation-2',
          bg: 'white',
        },
      },
      variants: {
        muted: { container: { bg: 'white', boxShadow: 'elevation-1' } },
        rose: { container: { bg: 'pastel.rose.200' } },
      },
    },
  },
})

export default theme
