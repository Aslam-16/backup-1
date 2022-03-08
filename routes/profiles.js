const express=require('express');
const {check,validationResult}=require('express-validator');
const bcrypt=require('bcryptjs');
const mongoose = require('mongoose');
const jwt=require('jsonwebtoken');
const router=express.Router()
const profile=require('../models/profilesmodel');
const user=require('../models/usersmodel');
const auth=require('./auth/verify');

router.get(`/`,(req,res)=>res.send(`from profiles`));


router.get(`/profiles`,auth,async (req,res)=>{
   const profiles=await profile.find().populate('user',['name']);
   if(profiles){
       res.send(profiles);
       console.log(req.userid);
   }
   else{
       res.send('no profile found');
   }
})
router.get(`/profiles/:id`,auth,async (req,res)=>{
   const profiles=await profile.findOne({user:req.userid}).populate('user',['name']);
   if(profiles){
       res.send(profiles);
       console.log(req.userid);
   }
   else{
       res.send('no profile found');
   }
})
router.post(`/updateprofiles`,auth,async (req,res)=>{
     const profileFields = {};
    profileFields.user = req.userid;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Spilt into array
    if (typeof req.body.skills !== 'undefined') {
      profileFields.skills = req.body.skills.split(',');
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

   const profiles1=await profile.findOne({user:req.userid});
   if(profiles1){
     await profiles1.findOneAndUpdate({user:req.userid},{$set:profileFields},{new:true})
       console.log(profileFields);
     res.send(profiles)
   }
   else{
       const newprofiles=new profile(profileFields);
       console.log(req.userid);
       await newprofiles.save();
       res.send(newprofiles);
   }
})

router.delete('/deleteprofile',auth,async(req,res)=>{
   let profiles=await profile.findOne({user:req.userid});
   if(profiles){
  let pr=await profile.findOneAndRemove({user:req.userid});
  res.send('removed');
   }
  else
  res.send('no profile')
})
router.post(`/addexperience`,auth,async(req,res)=>{
  let profiles=await profile.findOne({user:req.userid});
  if(profiles){
     const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      profiles.experience.unshift(newExp);
      profiles.save();
      res.send(profiles);
  }
  else{
    res.send(`no profile found`)
  }
})
router.post(`/addeducation`,auth,async(req,res)=>{
  let profiles=await profile.findOne({user:req.userid});
  if(profiles){
     const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      profiles.education.unshift(newEdu);
      profiles.save();
      res.send(profiles);
  }
  else{
    res.send(`no profile found`)
  }
})

router.delete(`/deleteeducation/:id`,auth,async(req,res)=>{
  let profiles=await profile.findOne({user:req.userid});
  if(profiles){
    const newedu=profiles.education.forEach((edu,index)=>{
      if(edu._id==req.params.id){
        return index;
      }
    })
    profiles.education.splice(newedu,1);
    profiles.save();
    res.send(profiles)
  }
  else{
    res.send(`no profile found`)
  }
});
router.delete(`/deleteexperience/:id`,auth,async(req,res)=>{
  let profiles=await profile.findOne({user:req.userid});
  if(profiles){
    const newedu=profiles.experience.forEach((edu,index)=>{
      if(edu._id==req.params.id){
        return index;
      }
    })
    profiles.experience.splice(newedu,1);
    profiles.save();
    res.send(profiles)
  }
  else{
    res.send(`no profile found`);
  }
})


module.exports=router;