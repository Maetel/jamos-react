// import objectHash from "object-hash";

export const clamp = (val: number, min: number, max: number) =>
  Math.max(Math.min(val, max), min);
// export const hash = (_) => objectHash.sha1(_);

export const focusout = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

export const random = (from: number, to?: number): number => {
  if (!to) {
    return Math.random() * from;
  }
  return from + Math.random() * (to - from);
};

const makeChars = () => {
  const retval = [
    32, //space
    187,
    189, // - +
    219,
    221, // []
    191, // /
    192, // ~
    186,
    222, // ; '
    188,
    190, // < >
    220, // \
  ];

  //number keycodes
  for (let i = 48; i < 58; ++i) {
    retval.push(i);
  }

  //characters
  for (let i = 65; i < 91; ++i) {
    retval.push(i);
  }

  return retval;
};

export const charKeyCodes = makeChars();
export const randomId: (digit?: number) => string = (digit: number = 16) => {
  let result = "";
  let characters =
    // 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let charactersLength = characters.length;
  for (let i = 0; i < digit; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

//cookies, https://www.w3schools.com/js/js_cookies.asp

export function setCookie(cname: string, cvalue: string, exdays?: number) {
  // if(getCookie(cname)){
  //   throw new Error(`Same cookie name already exist : ${cname}`);
  // }
  let retval = cname + "=" + cvalue + ";";
  if (exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    retval = retval + expires + ";path=/";
  }
  document.cookie = retval;
}

//return undefined when not found
export function getStorage(cname:string): string | null {
  return localStorage.getItem(cname);
}

export function setStorage(cname:string, value:string) {
  localStorage.setItem(cname, value);
}

export function getCookie(cname:string): string | undefined{
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return undefined;
}

export const getBase64 = (fileBlob:Blob) => {
  var reader = new FileReader();
  reader.readAsDataURL(fileBlob);
  reader.onload = function () {
    console.log(reader.result);
  };
  reader.onerror = function (error) {
    console.log("Error: ", error);
  };
};
