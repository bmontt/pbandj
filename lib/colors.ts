// PB&J Color Palette for consistent theming across the application

export const PBJ_COLORS = {
  // Peanut butter shades
  peanutButter: '#B58657',      // Rich peanut butter brown
  peanutButterLight: '#CDA47F', // Light peanut butter  
  peanutButterDark: '#8B6642',  // Dark peanut butter
  
  // Jelly/jam shades  
  grapeJelly: '#935BAD',        // Purple grape jelly
  strawberryJam: '#C44D58',     // Red strawberry jam
  apricotJam: '#EA9A6C',        // Orange apricot jam
  
  // Bread shades
  wholeWheatBread: '#A07E54',   // Whole wheat bread
  whiteBread: '#F5EBDC',        // White bread crust
  toastedBread: '#C69A6C',      // Toasted bread
  
  // Utility colors with opacity variants
  text: {
    peanutButter: 'text-[#B58657]',
    peanutButterLight: 'text-[#CDA47F]', 
    grapeJelly: 'text-[#935BAD]',
    strawberryJam: 'text-[#C44D58]',
    apricotJam: 'text-[#EA9A6C]',
    toastedBread: 'text-[#C69A6C]',
  },
  
  hover: {
    peanutButter: 'hover:text-[#B58657]/70',
    grapeJelly: 'hover:text-[#935BAD]/70',
    strawberryJam: 'hover:text-[#C44D58]/70',
    apricotJam: 'hover:text-[#EA9A6C]/70',
  }
}

export default PBJ_COLORS