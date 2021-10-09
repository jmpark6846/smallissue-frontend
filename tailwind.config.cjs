module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.svelte'],
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwind-content-placeholder')({
      height:1.5,
      placeholders: {
        'text': {
          height:1,
          width:200
        },
        'text-long':{
          height:1,
          width:350
        },
        'text-short':{
          height:1,
          width:100
        },
        'button':{
          height:1,
          width:80
        },
        'paragraph': {
          height: 4, // the height of the container in em
          rows: [ // This class will have 4 rows:
            [100], // A 100% width row
            [100], // Another 100% width row
            [40], // A 40% width row
            [] // And an empty row, to create separation
          ]
        },
      },
    }),
  ],
  theme: {
    extend: {
      minWidth:{
        '40': '10rem',
        '48': '12rem'
      },
      spacing: {
        '104': '26rem',
        '112': '28rem',
        '120': '30rem',
        '128': '32rem',
      },
      colors: {
        primary: '#2563EB',
        'primary-dark': '#1E40AF',
      }
    }
  },
  variants: {
    extend: {
      opacity: ['disabled'],
    }
  },
} 