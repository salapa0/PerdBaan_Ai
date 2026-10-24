// Data shapes. Update this file whenever you change a format.
/** @typedef {{id:string,name:string,price:number,count:number,custom?:boolean}} Room */
/** @typedef {{name:string,location:string,contact:{phone:string},totalRooms:number,rooms:Room[],amenities:string[],amenityOtherOn:boolean,amenityOther:string,features:string,photos:string[]}} Intake  (owner's form; rooms = room types, counts add up to totalRooms; photos = image URLs or data URLs, the first is the cover, at most MAX_PHOTOS) */
/** @typedef {{title_th:string,title_en:string,title_zh:string,desc_th:string,desc_en:string,desc_zh:string,location_en?:string,location_zh?:string,tr_en?:Record<string,string>,tr_zh?:Record<string,string>}} Draft  (AI listing; location_* is the place name and tr_* translates owner-typed room / amenity names, both optional) */
/** @typedef {{screen:string,label:string,value:string,hintOnly?:boolean}} CopyCard */
/** @typedef {{level:'error'|'warn',id:string,msg:string}} Finding */
/** @typedef {{screen_id:string,explain_th:string,highlight:string,source:'Live AI'|'Saved (cached)'}} CoachResult */
export {};
