export const catalog = [
 {id:'1',title:'After Hours',artist:'Music Lab Sessions',genre:'Electronic',duration:48,audio:'/audio/1.wav',cover:'/covers/1.svg'},
 {id:'2',title:'Soft Focus',artist:'Music Lab Sessions',genre:'Ambient',duration:48,audio:'/audio/2.wav',cover:'/covers/2.svg'},
 {id:'3',title:'Golden Hour',artist:'Music Lab Sessions',genre:'Chill',duration:48,audio:'/audio/3.wav',cover:'/covers/3.svg'},
 {id:'4',title:'Blue Monday',artist:'Music Lab Sessions',genre:'Electronic',duration:48,audio:'/audio/4.wav',cover:'/covers/4.svg'},
 {id:'5',title:'Slow Motion',artist:'Music Lab Sessions',genre:'Chill',duration:48,audio:'/audio/5.wav',cover:'/covers/5.svg'},
 {id:'6',title:'Somewhere Else',artist:'Music Lab Sessions',genre:'Ambient',duration:48,audio:'/audio/6.wav',cover:'/covers/6.svg'},
];
export type Song = typeof catalog[number];
