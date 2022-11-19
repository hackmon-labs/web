

export const FIND_URL ='/api/getUser/find'
export const CEATE_URL = '/api/getUser/create'
export const ATTACK_URL = '/api/hackmon/attack'
export const ATTACKSTRAT_URL = '/api/hackmon/attackStart'
export const RECOVER_URL = '/api/hackmon/recover'
export const GETNFTS_URL = '/api/hackmon/nfts'
export const UPDATEITEM_URL = '/api/hackmon/updateItem'



export const fethchFn = (params) => {
  const { url,token, ...otherParams } = params
  return fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}${url}`, {
    method: 'post',
    headers: token?{
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${token}`
    }:{
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...otherParams
    })
  })
}

