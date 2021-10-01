module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.svelte'],
  plugins: [
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
      colors: {
        primary: '#2563EB',
        'primary-dark': '#1E40AF',
      }
    }
  }
} 