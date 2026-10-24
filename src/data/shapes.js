// Data shapes. Update this file whenever you change a format.
/** @typedef {{id:string,name:string,price:number,count:number,custom?:boolean}} Room */
/** @typedef {{name:string,location:string,contact:{phone:string},totalRooms:number,rooms:Room[],amenities:string[],amenityOtherOn:boolean,amenityOther:string,features:string}} Intake  (owner's form; rooms = room types, counts add up to totalRooms) */
/** @typedef {{title_th:string,title_en:string,title_zh:string,desc_th:string,desc_en:string,desc_zh:string}} Draft  (AI listing) */
/** @typedef {{screen:string,label:string,value:string,hintOnly?:boolean}} CopyCard */
/** @typedef {{level:'error'|'warn',id:string,msg:string}} Finding */
/** @typedef {{screen_id:string,explain_th:string,highlight:string,source:'Live AI'|'Saved (cached)'}} CoachResult */
export {};
