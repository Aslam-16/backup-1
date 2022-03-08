const mongoose=require('mongoose');
const app=require('express');
const router=app.Router();
const post=require('../models/postmodel');
const user=require('../models/usersmodel');
const {check,validationResult}=require('express-validator');
const auth=require('./auth/verify')

router.get('/',auth,(req,res)=>res.send('from post'));

router.post(`/addpost`,[auth,check('text','text is required').not().isEmpty()],async (req,res)=>{
    const error=validationResult(req);
    if(!error.isEmpty()){
        res.send(error)
    }
    else{
        const users=await user.findById(req.userid);
        const name=await users.name;
        const text=req.body.text;
        let userid=req.userid;
        const postdata={
            text:text,
            name:name,
            user:userid
        }

        const posts=new post(postdata);
        await posts.save();

        res.send(posts);
 
    }
})
router.get('/allposts',auth,async(req,res)=>{
    const allposts=await post.find();
    if(allposts){
        res.send(allposts);
    }
    else{
        res.send(`no post found`)
    }
});
router.get('/getposts/:id',auth,async(req,res)=>{
    const allposts=await post.findOne({_id:req.params.id});
    if(allposts){
        res.send(allposts);
    }
    else{
        res.send(`no post found`)
    }
});
router.delete('/deleteposts/:id',auth,async(req,res)=>{
    const allposts=await post.findOne({_id:req.params.id});
    if(allposts.user.toString()==req.userid){
        await allposts.remove();
        res.send('deleted');
    }
    else{
        res.send(`not the post owner`)
    }
});
router.delete('/deletemyposts',auth,async(req,res)=>{
    const allposts=await post.find({user:req.userid});
    if(allposts.length!=0){
         await post.deleteMany({user:req.userid})
         

        res.send('deleted all the posts');
    }
    else{
        res.send(`no post exist`)
    }
});
router.get('/myposts',auth,async(req,res)=>{
    const allposts=await post.find({user:req.userid});
    if(allposts.length=0){
        res.send(allposts);
    }
    else{
        res.send('no post found')
    }
});
router.put('/addlikes/:id',auth,async(req,res)=>{
    const getpost=await post.findById(req.params.id);

    if(getpost.likes.filter(id=>id.user.toString()===req.userid).length>0){
        res.send('already liked by you')
    }
    else{
        getpost.likes.unshift({user:req.userid});
        await getpost.save();
        res.send('liked')
    }

});
router.put('/removelikes/:id',auth,async(req,res)=>{
    const getpost=await post.findById(req.params.id);
    let indexes=null;
    getpost.likes.filter((id,index)=>{
        if(id.user.toString()===req.userid){
        indexes=index;
        }
    })

    if(indexes==null){
        res.send('not liked by you yet')
    }
    else{
        getpost.likes.splice(indexes,1);
        await getpost.save();
        res.send('disliked')
    }

})
router.put('/addcmt/:id',auth,async(req,res)=>{
    const getpost=await post.findById(req.params.id);
    const getuser=await user.findById(req.userid);
    const data={
        text:req.body.text,
        name:getuser.name,
        user:req.userid
    }

    getpost.comments.unshift(data);
    getpost.save();
    res.send('commented successfully')

   
});
router.put('/removecmt/:id',auth,async(req,res)=>{
    const getpost=await post.findById(req.params.id);
    let indexes=null;
    getpost.comments.filter((id,index)=>{
        if(id.user.toString()===req.userid){
        indexes=index;
        }
    })

    if(indexes==null){
        res.send('not commented by you yet')
    }
    else{
        getpost.comments.splice(indexes,1);
        await getpost.save();
        res.send('uncommented')
    }

})


module.exports=router;
