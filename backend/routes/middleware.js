import jwt from "jsonwebtoken"


export function verifyToken(req, res, next){
    if(!req.cookies){
        res.status(401).send({success:false, message:"Unauthorized Access!"})
    }
    const token = req.cookies.token;


    if(!token){
        res.status(401).send({success:false, message:"Unauthorized Access!"})
    }else{
        jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
            if(err){
                return res.status(401).send({success:false, message:"Unauthorized Access!"})
            }else{
                req.user = decoded; //Gets the payload and sets it to req.user.
                next();
            }
        })
    }
}


