require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const XLSX = require("xlsx");
const dns = require("dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const Contact = require("./models/Contact");
const Template = require("./models/Template");
const EmailLog = require("./models/EmailLog");
const { runScheduler } = require("./scheduler");
const { startReplyChecker } = require("./replyChecker");
const { fillTemplate } = require("./templateEngine");
const { sendEmail } = require("./mailer");

const app = express();
app.use(express.json());
app.use(cors());

/* =========================
   SEED DATA
========================= */
async function seedTemplates() {
  await Template.deleteOne({ name: "Welcome" });
  await Template.deleteOne({ name: "Premium Outreach" });
  
  const defaults = [
    { 
      name: "Welcome", 
      order: 0, 
      delayDays: 0, 
      subject: "Your Brand Looks Premium", 
      htmlBody: `<div class="msg251766921847744896"><div width="100%" class="m_251766921847744896body" style="margin:0px;padding:0px!important;background-color:rgb(229,229,229)"><div aria-hidden="true" style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;font-family:sans-serif">One quick observation for Your Business.</div><div style="display:none;max-height:0px;max-width:0px;opacity:0;overflow:hidden">͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ ͏‌ </div><div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;font-family:sans-serif"></div><center lang="en" style="width:100%;background-color:rgb(229,229,229)"><div class="m_251766921847744896e-c" style="max-width:640px;margin:0px auto"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:auto"><tbody><tr><td style="padding:20px 10px;text-align:center"><a href="https://stats.sender.net/campaigns/f6fE/preview" style="font-size:13px;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(64,64,64)" target="_blank">Is this email not displaying correctly? View it in your browser.</a></td></tr></tbody></table></div><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" class="m_251766921847744896e-c m_251766921847744896sect-TDoAz7"><tbody><tr><td bgcolor="transparent" style="background-color:transparent"><div class="m_251766921847744896e-c" style="max-width:640px;margin:0px auto"><table align="center" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:100%;width:100%"><tbody><tr><td width="0"></td><td bgcolor="#EDEDED" background="https://cdn.sender.net/email_images/442122/images/all/digital_vibe_solutions_digital_marketing_services_in_delhi_ncr_ghaziab.jpg" width="100%" style="border-radius:0px;background-color:rgb(237,237,237);width:100%;background-origin:border-box;background-position:center bottom;background-size:auto;background-repeat:no-repeat;background-image:url(&quot;https://ci3.googleusercontent.com/meips/ADKq_NaAZhClr73fTOjBe0ci9A6cvr0jEcnxbfwMAk2egTjSc-GQ88wR8Ee8NeMj2dLvj7fFfkRUSrgRgAA0o1l5k6SJFRr-RzGlTqKigOc0v15QmbQHj9OxWG8G7lOj_SOubr_r4dfqCmeI8TqmnEKj-wDP9WAuvqGYGBfk-wO1r1adBzC3C5YazQSVVEThlae64lUo5ilZkCM=s0-d-e1-ft#https://cdn.sender.net/email_images/442122/images/all/digital_vibe_solutions_digital_marketing_services_in_delhi_ncr_ghaziab.jpg&quot;)"><div style="font-size:0px;line-height:0"><table style="border-spacing:0px"><tbody><tr><td class="m_251766921847744896s-sp_l" width="45" style="padding-left:45px;padding-right:0px"></td><td class="m_251766921847744896s-sp" width="100%" style="padding:10px 0px 15px"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td align="center" valign="top" style="font-size:0px;padding:0px"><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:335px;background-color:transparent;box-sizing:border-box;margin:0px;vertical-align:top;max-width:547px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:top"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td class="m_251766921847744896i-tltd" align="left" style="padding:35px 0px 15px"><div><img width="74" src="https://cdn.sender.net/email_images/442122/images/all/digitalvibesolutionslogo.jpg" alt="Image description" border="0" class="m_251766921847744896g-img" style="display:block;box-sizing:border-box;max-width:100%;border-radius:0px"><div></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:10px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(237,237,237);font-size:33px;text-align:left;line-height:140%"><div><div><p><p>Hi {{name}},</p><p><strong>Your Collection Looks Premium,</strong></p></p><p><strong>But Digital Presentation Can Become Stronger.</strong></p></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td bgcolor="transparent" class="m_251766921847744896i-tltd" style="padding:15px 0px 35px;text-align:center"><table width="auto" border="0" cellpadding="0" cellspacing="0" class="m_251766921847744896btn-wr_t" align="center" style="border-collapse:separate!important"><tbody><tr><th valign="middle" align="center" dir="ltr" style="vertical-align:middle;border:none;margin:0px;padding:0px;border-radius:30px;background-color:rgb(244,73,72)"><a valign="middle" align="center" href="https://www.digitalvibesolutions.com/digital-marketing-services-in-delhi-ncr" style="text-align:center;text-decoration:none;line-height:16px;border-radius:30px;display:inline-block;width:auto" target="_blank"><span style="padding-left:11px;padding-right:11px;border-top:16px solid transparent;border-bottom:16px solid transparent;font-size:16px;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(0,0,0);text-decoration:none;font-weight:bold;font-style:normal;display:block">Know more</span></a></th></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div></div></div></td></tr></tbody></table></td><td class="m_251766921847744896s-sp_r" width="48" style="padding-left:48px;padding-right:0px"></td></tr></tbody></table></div></td><td width="0"></td></tr></tbody></table></div></td></tr></tbody></table><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" class="m_251766921847744896e-c m_251766921847744896sect-2e5LG1"><tbody><tr><td bgcolor="transparent" style="background-color:transparent"><div class="m_251766921847744896e-c" style="max-width:640px;margin:0px auto"><table align="center" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:100%;width:100%"><tbody><tr><td width="0"></td><td bgcolor="transparent" width="100%" style="border-radius:0px;background-color:transparent;width:100%"><div style="font-size:0px;line-height:0"><table style="border-spacing:0px"><tbody><tr><td class="m_251766921847744896s-sp_l" width="0" style="padding-left:0px;padding-right:0px"></td><td class="m_251766921847744896s-sp" width="100%" style="padding:0px"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td align="center" valign="top" style="font-size:0px;padding:0px"><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:3px;box-sizing:border-box;margin:0px;vertical-align:top;max-width:640px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:top"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="center" bgcolor="#ffffff" style="padding:0px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td width="100%" style="border-collapse:initial!important;width:100%"><table width="100%" style="background-color:rgb(255,255,255);border-top:1px solid rgb(255,249,238)"><tbody><tr><td></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div></div></div></td></tr></tbody></table></td><td class="m_251766921847744896s-sp_r" width="0" style="padding-left:0px;padding-right:0px"></td></tr></tbody></table></div></td><td width="0"></td></tr></tbody></table></div></td></tr></tbody></table><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" class="m_251766921847744896e-c m_251766921847744896sect-qKDZdo"><tbody><tr><td bgcolor="transparent" style="background-color:transparent"><div class="m_251766921847744896e-c" style="max-width:640px;margin:0px auto"><table align="center" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:100%;width:100%"><tbody><tr><td width="0"></td><td bgcolor="#f4f4f4" width="100%" style="border-radius:0px;background-color:rgb(244,244,244);width:100%"><div style="font-size:0px;line-height:0"><table style="border-spacing:0px"><tbody><tr><td class="m_251766921847744896s-sp_l" width="48" style="padding-left:48px;padding-right:0px"></td><td class="m_251766921847744896s-sp" width="100%" style="padding:10px 0px"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td align="center" valign="top" style="font-size:0px;padding:0px"><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:56px;box-sizing:border-box;margin:0px;vertical-align:top;max-width:359.333px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:top"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:10px 10px 10px 0px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:11px;text-align:left;line-height:150%"><div><div><p><strong>Aaj fashion sirf product se nahi, presentation se sell hota hai.</strong><br><strong>See how we help brands →</strong></p></div></div></td></tr></tbody></table></td></tr></tbody></table></div></div></div><div class="m_251766921847744896st-cmvs" style="display:none"><table align="center" cellspacing="0" cellpadding="0" border="0" style="margin:0px;max-width:100%;width:100%"><tbody><tr><td style="padding:0px"></td></tr></tbody></table></div><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:56px;box-sizing:border-box;margin:0px 0px 0px 10px;vertical-align:top;max-width:174.667px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:top"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="right" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:10px 10px 10px 0px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(228,12,8);font-size:12px;text-align:right;line-height:150%"><div><div><p><strong>Explore how your business can look online.</strong></p></div></div></td></tr></tbody></table></td></tr></tbody></table></div></div></div></td></tr></tbody></table></td><td class="m_251766921847744896s-sp_r" width="48" style="padding-left:48px;padding-right:0px"></td></tr></tbody></table></div></td><td width="0"></td></tr></tbody></table></div></td></tr></tbody></table><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" class="m_251766921847744896e-c m_251766921847744896sect-XHvFbH"><tbody><tr><td bgcolor="transparent" style="background-color:transparent"><div class="m_251766921847744896e-c" style="max-width:640px;margin:0px auto"><table align="center" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:100%;width:100%"><tbody><tr><td width="0"></td><td bgcolor="transparent" width="100%" style="border-radius:0px;background-color:transparent;width:100%"><div style="font-size:0px;line-height:0"><table style="border-spacing:0px"><tbody><tr><td class="m_251766921847744896s-sp_l" width="0" style="padding-left:0px;padding-right:0px"></td><td class="m_251766921847744896s-sp" width="100%" style="padding:0px"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td align="center" valign="top" style="font-size:0px;padding:0px"><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:4px;box-sizing:border-box;margin:0px;vertical-align:top;max-width:640px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:top"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="center" bgcolor="#ffffff" style="padding:0px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td width="100%" style="border-collapse:initial!important;width:100%"><table width="100%" style="background-color:rgb(255,255,255);border-top:2px solid rgb(44,44,44)"><tbody><tr><td></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div></div></div></td></tr></tbody></table></td><td class="m_251766921847744896s-sp_r" width="0" style="padding-left:0px;padding-right:0px"></td></tr></tbody></table></div></td><td width="0"></td></tr></tbody></table></div></td></tr></tbody></table><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" class="m_251766921847744896e-c m_251766921847744896sect-JaqZ5P"><tbody><tr><td bgcolor="transparent" style="background-color:transparent"><div class="m_251766921847744896e-c" style="max-width:640px;margin:0px auto"><table align="center" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:100%;width:100%"><tbody><tr><td width="0"></td><td bgcolor="#f4f4f4" width="100%" style="border-radius:0px;background-color:rgb(244,244,244);width:100%"><div style="font-size:0px;line-height:0"><table style="border-spacing:0px"><tbody><tr><td class="m_251766921847744896s-sp_l" width="48" style="padding-left:48px;padding-right:0px"></td><td class="m_251766921847744896s-sp" width="100%" style="padding:48px 0px 0px"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td align="center" valign="top" style="font-size:0px;padding:0px"><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:395px;box-sizing:border-box;margin:0px;vertical-align:top;max-width:511px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:top"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="center" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:0px;direction:ltr;font-family:Arial;color:rgb(44,44,44);font-size:25px;text-align:left;font-weight:bold;font-style:normal;text-decoration:none;line-height:150%"><div><div><p>A Small Digital Improvement Can Create Stronger Customer Confidence.</p></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:16px 0px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:16px;text-align:left;line-height:150%"><div><div><p>Aaj fashion sirf product se nahi, presentation se sell hota hai.</p><p>Today customers often check Instagram, website, and online trust before making a buying decision.</p><p><br></p></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:16px 0px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(0,0,0);font-size:16px;text-align:left;line-height:150%"><div><div><p><strong>Preview how your business can look online.</strong></p><p><a rel="noopener noreferrer nofollow" href="https://example-clothing.vercel.app/" style="color:rgb(228,12,8)" target="_blank"><strong>Free Demo Website : Click Here! </strong></a></p></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:16px 0px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:16px;text-align:left;line-height:150%"><div><div><p>Now it’s your turn to build your digital shop.</p></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:16px 0px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:16px;text-align:left;line-height:150%"><div><div><p><strong>We help fashion brands improve digital growth through:</strong></p></div></div></td></tr></tbody></table></td></tr></tbody></table></div></div></div></td></tr></tbody></table></td><td class="m_251766921847744896s-sp_r" width="81" style="padding-left:81px;padding-right:0px"></td></tr></tbody></table></div></td><td width="0"></td></tr></tbody></table></div></td></tr></tbody></table><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" class="m_251766921847744896e-c m_251766921847744896sect-PxZybn"><tbody><tr><td bgcolor="transparent" style="background-color:transparent"><div class="m_251766921847744896e-c" style="max-width:640px;margin:0px auto"><table align="center" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:100%;width:100%"><tbody><tr><td width="0"></td><td bgcolor="#f4f4f4" width="100%" style="border-radius:0px;background-color:rgb(244,244,244);width:100%"><div style="font-size:0px;line-height:0"><table style="border-spacing:0px"><tbody><tr><td class="m_251766921847744896s-sp_l" width="48" style="padding-left:48px;padding-right:0px"></td><td class="m_251766921847744896s-sp" width="100%" style="padding:32px 0px 0px"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td align="center" valign="top" style="font-size:0px;padding:0px"><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:124px;box-sizing:border-box;margin:0px;vertical-align:middle;max-width:260px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:middle"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td class="m_251766921847744896i-tltd" align="left" bgcolor="transparent" style="padding:0px"><div class="m_251766921847744896b-BSgvYS"><a href="https://www.digitalvibesolutions.com/digital-marketing-services-in-delhi-ncr/web-development" target="_blank"><img width="40" src="https://cdn.sender.net/email_images/442122/images/all/web_design_development_service.jpg" alt="Website Design &amp; Development" border="0" style="display:block;box-sizing:border-box;max-width:100%;border-radius:0px"></a></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:8px 0px 4px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:16px;text-align:left;line-height:150%"><div><div><p><a rel="noopener noreferrer nofollow" href="https://www.digitalvibesolutions.com/digital-marketing-services-in-delhi-ncr/web-development" style="color:rgb(0,0,0)" target="_blank"><strong>Website Design &amp; Development</strong></a></p></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:0px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:16px;text-align:left;line-height:150%"><div><div><p>Build a digital shop that creates trust instantly.</p></div></div></td></tr></tbody></table></td></tr></tbody></table></div></div></div><div class="m_251766921847744896st-cmvs" style="display:none"><table align="center" cellspacing="0" cellpadding="0" border="0" style="margin:0px;max-width:100%;width:100%"><tbody><tr><td style="padding:24px 0px 0px"></td></tr></tbody></table></div><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:124px;box-sizing:border-box;margin:0px 0px 0px 24px;vertical-align:middle;max-width:260px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:middle"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td class="m_251766921847744896i-tltd" align="left" bgcolor="transparent" style="padding:0px"><div class="m_251766921847744896b-5LMuiQ"><img width="40" src="https://cdn.sender.net/email_images/442122/images/all/seo_search_engine_optimization_service.jpg" alt="SEO" border="0" class="m_251766921847744896g-img" style="display:block;box-sizing:border-box;max-width:100%;border-radius:0px"><div></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:8px 0px 4px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:16px;text-align:left;line-height:150%"><div><div><p><a rel="noopener noreferrer nofollow" href="https://www.digitalvibesolutions.com/digital-marketing-services-in-delhi-ncr/seo-optimization" style="color:rgb(0,0,0)" target="_blank"><strong>SEO</strong></a></p></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:0px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:16px;text-align:left;line-height:150%"><div><div><p>Help customers find your business faster online.</p></div></div></td></tr></tbody></table></td></tr></tbody></table></div></div></div></td></tr></tbody></table></td><td class="m_251766921847744896s-sp_r" width="48" style="padding-left:48px;padding-right:0px"></td></tr></tbody></table></div></td><td width="0"></td></tr></tbody></table></div></td></tr></tbody></table><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" class="m_251766921847744896e-c m_251766921847744896sect-tzSP14"><tbody><tr><td bgcolor="transparent" style="background-color:transparent"><div class="m_251766921847744896e-c" style="max-width:640px;margin:0px auto"><table align="center" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:100%;width:100%"><tbody><tr><td width="0"></td><td bgcolor="#f4f4f4" width="100%" style="border-radius:0px;background-color:rgb(244,244,244);width:100%"><div style="font-size:0px;line-height:0"><table style="border-spacing:0px"><tbody><tr><td class="m_251766921847744896s-sp_l" width="48" style="padding-left:48px;padding-right:0px"></td><td class="m_251766921847744896s-sp" width="100%" style="padding:32px 0px 48px"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td align="center" valign="top" style="font-size:0px;padding:0px"><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:124px;box-sizing:border-box;margin:0px;vertical-align:middle;max-width:260px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:middle"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td class="m_251766921847744896i-tltd" align="left" bgcolor="transparent" style="padding:0px"><div class="m_251766921847744896b-ozf90s"><img width="40" src="https://cdn.sender.net/email_images/442122/images/all/social_media_marketing_service.jpg" alt="Social Media Marketing" border="0" class="m_251766921847744896g-img" style="display:block;box-sizing:border-box;max-width:100%;border-radius:0px"><div></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:8px 0px 4px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:16px;text-align:left;line-height:150%"><div><div><p><a rel="noopener noreferrer nofollow" href="https://www.digitalvibesolutions.com/digital-marketing-services-in-delhi-ncr/social-media-marketing" style="color:rgb(0,0,0)" target="_blank"><strong>Social Media Marketing</strong></a></p></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:0px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:16px;text-align:left;line-height:150%"><div><div><p>Turn visibility into engagement and trust.</p></div></div></td></tr></tbody></table></td></tr></tbody></table></div></div></div><div class="m_251766921847744896st-cmvs" style="display:none"><table align="center" cellspacing="0" cellpadding="0" border="0" style="margin:0px;max-width:100%;width:100%"><tbody><tr><td style="padding:24px 0px 0px"></td></tr></tbody></table></div><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:124px;box-sizing:border-box;margin:0px 0px 0px 24px;vertical-align:middle;max-width:260px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:middle"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td class="m_251766921847744896i-tltd" align="left" bgcolor="transparent" style="padding:0px"><div class="m_251766921847744896b-DQoVwU"><img width="40" src="https://cdn.sender.net/email_images/442122/images/all/app_development_service.png" alt="App Development" border="0" class="m_251766921847744896g-img" style="display:block;box-sizing:border-box;max-width:100%;border-radius:0px"><div></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:8px 0px 4px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:16px;text-align:left;line-height:150%"><div><div><p><a rel="noopener noreferrer nofollow" href="https://www.digitalvibesolutions.com/digital-marketing-services-in-delhi-ncr/app-development" style="color:rgb(0,0,0)" target="_blank"><strong>App Development</strong></a></p></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:0px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:16px;text-align:left;line-height:150%"><div><div><p>Make your business accessible anytime, anywhere.</p></div></div></td></tr></tbody></table></td></tr></tbody></table></div></div></div></td></tr></tbody></table></td><td class="m_251766921847744896s-sp_r" width="48" style="padding-left:48px;padding-right:0px"></td></tr></tbody></table></div></td><td width="0"></td></tr></tbody></table></div></td></tr></tbody></table><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" class="m_251766921847744896e-c m_251766921847744896sect-6bnOPD"><tbody><tr><td bgcolor="transparent" style="background-color:transparent"><div class="m_251766921847744896e-c" style="max-width:640px;margin:0px auto"><table align="center" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:100%;width:100%"><tbody><tr><td width="0"></td><td bgcolor="#f4f4f4" width="100%" style="border-radius:0px;background-color:rgb(244,244,244);width:100%"><div style="font-size:0px;line-height:0"><table style="border-spacing:0px"><tbody><tr><td class="m_251766921847744896s-sp_l" width="48" style="padding-left:48px;padding-right:0px"></td><td class="m_251766921847744896s-sp" width="100%" style="padding:32px 0px 48px"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td align="center" valign="top" style="font-size:0px;padding:0px"><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:128px;box-sizing:border-box;margin:0px;vertical-align:middle;max-width:260px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:middle"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td class="m_251766921847744896i-tltd" align="left" bgcolor="transparent" style="padding:0px"><div class="m_251766921847744896b-T_ELNl"><img width="40" src="https://cdn.sender.net/email_images/442122/images/all/photo_video_shoot_service.jpg" alt="Photo &amp; Video Shoots" border="0" class="m_251766921847744896g-img" style="display:block;box-sizing:border-box;max-width:100%;border-radius:0px"><div></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:8px 0px 4px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:16px;text-align:left;line-height:150%"><div><div><p><a rel="noopener noreferrer nofollow" href="https://www.digitalvibesolutions.com/digital-marketing-services-in-delhi-ncr/photo-video-shoot" style="color:rgb(0,0,0)" target="_blank"><strong>Photo &amp; Video Shoots</strong></a></p></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="left" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:0px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:16px;text-align:left;line-height:150%"><div><div><p>Strong visuals create stronger brand impact.</p></div></div></td></tr></tbody></table></td></tr></tbody></table></div></div></div><div class="m_251766921847744896st-cmvs" style="display:none"><table align="center" cellspacing="0" cellpadding="0" border="0" style="margin:0px;max-width:100%;width:100%"><tbody><tr><td style="padding:24px 0px 0px"></td></tr></tbody></table></div><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:128px;box-sizing:border-box;margin:0px 0px 0px 24px;vertical-align:middle;max-width:260px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:middle"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="center" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:10px;direction:ltr;font-family:Arial;color:rgb(128,128,128);font-size:24px;text-align:center;font-weight:bold;font-style:normal;text-decoration:none;line-height:150%"><div><div><p>Your business deserves a premium digital shop now.</p></div></div></td></tr></tbody></table></td></tr></tbody></table></div></div></div></td></tr></tbody></table></td><td class="m_251766921847744896s-sp_r" width="48" style="padding-left:48px;padding-right:0px"></td></tr></tbody></table></div></td><td width="0"></td></tr></tbody></table></div></td></tr></tbody></table><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" class="m_251766921847744896e-c m_251766921847744896sect-ADesYJ"><tbody><tr><td bgcolor="transparent" style="background-color:transparent"><div class="m_251766921847744896e-c" style="max-width:640px;margin:0px auto"><table align="center" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:100%;width:100%"><tbody><tr><td width="0"></td><td bgcolor="#f4f4f4" width="100%" style="border-radius:0px;background-color:rgb(244,244,244);width:100%"><div style="font-size:0px;line-height:0"><table style="border-spacing:0px"><tbody><tr><td class="m_251766921847744896s-sp_l" width="48" style="padding-left:48px;padding-right:0px"></td><td class="m_251766921847744896s-sp" width="100%" style="padding:0px"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td align="center" valign="top" style="font-size:0px;padding:0px"><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:3px;box-sizing:border-box;margin:0px;vertical-align:top;max-width:544px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:top"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="center" bgcolor="transparent" style="padding:0px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td width="100%" style="border-collapse:initial!important;width:100%"><table width="100%" style="background-color:transparent;border-top:1px solid rgb(39,8,8)"><tbody><tr><td></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div></div></div></td></tr></tbody></table></td><td class="m_251766921847744896s-sp_r" width="48" style="padding-left:48px;padding-right:0px"></td></tr></tbody></table></div></td><td width="0"></td></tr></tbody></table></div></td></tr></tbody></table><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" class="m_251766921847744896e-c m_251766921847744896sect-qDb6cC"><tbody><tr><td bgcolor="transparent" style="background-color:transparent"><div class="m_251766921847744896e-c" style="max-width:640px;margin:0px auto"><table align="center" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:100%;width:100%"><tbody><tr><td width="0"></td><td bgcolor="transparent" width="100%" style="border-radius:0px;background-color:transparent;width:100%"><div style="font-size:0px;line-height:0"><table style="border-spacing:0px"><tbody><tr><td class="m_251766921847744896s-sp_l" width="0" style="padding-left:0px;padding-right:0px"></td><td class="m_251766921847744896s-sp" width="100%" style="padding:0px"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td align="center" valign="top" style="font-size:0px;padding:0px"><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:4px;box-sizing:border-box;margin:0px;vertical-align:top;max-width:640px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:top"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="center" bgcolor="#ffffff" style="padding:0px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td width="100%" style="border-collapse:initial!important;width:100%"><table width="100%" style="background-color:rgb(255,255,255);border-top:2px solid rgb(39,8,8)"><tbody><tr><td></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div></div></div></td></tr></tbody></table></td><td class="m_251766921847744896s-sp_r" width="0" style="padding-left:0px;padding-right:0px"></td></tr></tbody></table></div></td><td width="0"></td></tr></tbody></table></div></td></tr></tbody></table><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" class="m_251766921847744896e-c m_251766921847744896sect-7xhn_m"><tbody><tr><td bgcolor="transparent" style="background-color:transparent"><div class="m_251766921847744896e-c" style="max-width:640px;margin:0px auto"><table align="center" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:100%;width:100%"><tbody><tr><td width="0"></td><td bgcolor="#f4f4f4" width="100%" style="border-radius:0px;background-color:rgb(244,244,244);width:100%"><div style="font-size:0px;line-height:0"><table style="border-spacing:0px"><tbody><tr><td class="m_251766921847744896s-sp_l" width="48" style="padding-left:48px;padding-right:0px"></td><td class="m_251766921847744896s-sp" width="100%" style="padding:48px 0px 32px"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td align="center" valign="top" style="font-size:0px;padding:0px"><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:211px;box-sizing:border-box;margin:0px;vertical-align:top;max-width:544px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:top"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="center" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:0px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:16px;text-align:center;line-height:150%"><div><div><p><strong>Would you like to explore a few ideas for your business?</strong></p><p><br></p></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="center" class="m_251766921847744896i-tltd" bgcolor="transparent" style="padding:0px;direction:ltr;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(44,44,44);font-size:14px;text-align:center;line-height:150%"><div><div><p><strong>Book Your Free Consultation </strong>: </p><p>📞 <strong>+91 98211 26971</strong></p><p>🌐<a rel="noopener noreferrer nofollow" href="http://www.digitalvibesolutions.com" style="color:rgb(0,0,0)" target="_blank"><strong>www.digitalvibesolutions.com</strong></a><br><strong>📧</strong><a rel="noopener noreferrer nofollow" href="mailto:sales@digitalvibesolutions.com" style="color:rgb(0,0,0)" target="_blank"><strong>sales@digitalvibesolutions.com</strong></a><br><strong>📧</strong><a rel="noopener noreferrer nofollow" href="mailto:digitalvibesolutionsgroup@gmail.com" style="color:rgb(0,0,0)" target="_blank"><strong>digitalvibesolutionsgroup@gmail.com</strong></a></p></div></div></td></tr></tbody></table></td></tr></tbody></table><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td class="m_251766921847744896i-tltd m_251766921847744896social-block" align="center" bgcolor="transparent" style="padding:24px 0px 0px;line-height:0"><table width="auto" border="0" cellpadding="0" cellspacing="0" style="margin:0px!important"><tbody><tr align="center"><td><table><tbody><tr><td align="center"><a href="https://www.facebook.com/digitalvibeofficial" style="width:32px;display:inline-block" target="_blank"><img src="https://cdn.sender.net/email-editor/static/img/social/64/v10/facebook.png" width="32" alt="Facebook"></a></td></tr></tbody></table></td><td><a href="https://www.facebook.com/digitalvibeofficial" target="_blank"><span style="font-size:12px;line-height:120%;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(85,85,85);text-decoration:none;font-weight:normal;font-style:normal"></span></a></td><td width="26"></td><td><table><tbody><tr><td align="center"><a href="https://x.com/DigiVibeSol" style="width:32px;display:inline-block" target="_blank"><img src="https://cdn.sender.net/email-editor/static/img/social/64/v10/twitter.png?v=1" width="32" alt="Twitter"></a></td></tr></tbody></table></td><td><a href="https://x.com/DigiVibeSol" target="_blank"><span style="font-size:12px;line-height:120%;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(85,85,85);text-decoration:none;font-weight:normal;font-style:normal"></span></a></td><td width="26"></td><td><table><tbody><tr><td align="center"><a href="https://www.instagram.com/digitalvibesolutionscompany" style="width:32px;display:inline-block" target="_blank"><img src="https://cdn.sender.net/email-editor/static/img/social/64/v10/instagram.png" width="32" alt="Instagram"></a></td></tr></tbody></table></td><td><a href="https://www.instagram.com/digitalvibesolutionscompany" target="_blank"><span style="font-size:12px;line-height:120%;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(85,85,85);text-decoration:none;font-weight:normal;font-style:normal"></span></a></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div></div></div></td></tr></tbody></table></td><td class="m_251766921847744896s-sp_r" width="48" style="padding-left:48px;padding-right:0px"></td></tr></tbody></table></div></td><td width="0"></td></tr></tbody></table></div></td></tr></tbody></table><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" class="m_251766921847744896e-c m_251766921847744896sect-n3CDv4"><tbody><tr><td bgcolor="transparent" style="background-color:transparent"><div class="m_251766921847744896e-c" style="max-width:640px;margin:0px auto"><table align="center" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:100%;width:100%"><tbody><tr><td width="0"></td><td bgcolor="transparent" width="100%" style="border-radius:0px;background-color:transparent;width:100%"><div style="font-size:0px;line-height:0"><table style="border-spacing:0px"><tbody><tr><td class="m_251766921847744896s-sp_l" width="0" style="padding-left:0px;padding-right:0px"></td><td class="m_251766921847744896s-sp" width="100%" style="padding:0px"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td align="center" valign="top" style="font-size:0px;padding:0px"><div class="m_251766921847744896st-c" style="display:inline-table;padding-left:0px;padding-right:0px;min-height:3px;box-sizing:border-box;margin:0px;vertical-align:top;max-width:640px;min-width:160px;width:100%"><div class="m_251766921847744896mb-db" style="display:table-cell;vertical-align:top"><div class="m_251766921847744896st-ci"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="padding:0px;font-size:16px;line-height:normal"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:0px"><tbody><tr><td align="center" bgcolor="#ffffff" style="padding:0px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td width="100%" style="border-collapse:initial!important;width:100%"><table width="100%" style="background-color:rgb(255,255,255);border-top:1px solid rgb(255,249,238)"><tbody><tr><td></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div></div></div></td></tr></tbody></table></td><td class="m_251766921847744896s-sp_r" width="0" style="padding-left:0px;padding-right:0px"></td></tr></tbody></table></div></td><td width="0"></td></tr></tbody></table></div></td></tr></tbody></table><div class="m_251766921847744896e-c" style="max-width:640px;margin:0px auto"><table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" class="m_251766921847744896e-c" style="margin:auto"><tbody><tr><td style="padding:20px 0px;text-align:center"><a href="https://stats.sender.net/unsubscribe_preview/en" style="font-size:13px;font-family:Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;color:rgb(64,64,64)" target="_blank">If you would like to unsubscribe, please click here.</a></td></tr></tbody></table></div></center><table id="m_251766921847744896sender-branding" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:auto;text-align:center">
                      <tbody><tr>
                        <td style="text-align:center;padding:10px 0px 20px">
                          <a id="m_251766921847744896sender-branding-free-footer-link" href="https://sender.net" style="display:inline-block;padding:0px 10px 10px" target="_blank">
                            <img src="https://cdn.sender.net/img/free_plan_logo.png" alt="Sender.net" width="100">
                          </a>
                        </td>
                      </tr>
                  </tbody></table>
</div></div></div></div>
`
    }
  ];

  for (const template of defaults) {
    await Template.findOneAndUpdate(
      { name: template.name },
      template,
      { upsert: true, new: true }
    );
  }
  console.log("Templates seeded/updated.");
}

/* =========================
   MongoDB Connection
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongo Connected");
    seedTemplates();
    runScheduler();
    startReplyChecker();
  })
  .catch(err => console.log("Mongo Error:", err));

if (!process.env.GMAIL_BRIDGE_URL) {
  console.error("CRITICAL: GMAIL_BRIDGE_URL environment variable is MISSING on Render!");
}
/* =========================
   ROUTES
========================= */

// Health Check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "DigitalVibe Backend is running!" });
});

// Email Status Check (Now via Gmail Bridge)
app.get("/test-email", async (req, res) => {
  try {
    const result = await sendEmail({
      to: process.env.GMAIL_USER,
      subject: "Gmail Bridge / Direct Mail Active",
      body: "Your email system (Bridge or Direct) is correctly configured and reachable."
    });
    
    if (result.success) {
      res.json({ success: true, message: "Email system ready! Test email sent." });
    } else {
      throw new Error(result.error || "Sending failed");
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Bridge error: " + err.message });
  }
});

// Tracking & Analytics
app.get("/analytics", async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const stats = {
      total,
      new: await Contact.countDocuments({ stage: "new" }),
      contacted: await Contact.countDocuments({ stage: "contacted" }),
      reengaged: await Contact.countDocuments({ stage: "re-engaged" }),
      interested: await Contact.countDocuments({ stage: "interested" }),
      lto: await Contact.countDocuments({ stage: "lto" }),
      replied: await Contact.countDocuments({ replied: true }),
      converted: await Contact.countDocuments({ stage: "converted" })
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/tracking", async (req, res) => {
  try {
    const contacts = await Contact.find({ 
        $or: [
            { replied: true },
            { lastReplySnippet: { $exists: true, $ne: null } }
        ]
    }).sort({ updatedAt: -1 }).limit(50);
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Templates
app.get("/templates", async (req, res) => {
  const templates = await Template.find().sort({ order: 1 });
  res.json(templates);
});

app.post("/templates", async (req, res) => {
  const template = new Template(req.body);
  await template.save();
  res.json({ message: "Created" });
});

app.put("/templates/:id", async (req, res) => {
  await Template.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Template updated" });
});

// Contacts
app.get("/contacts", async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
});

// Upload
const upload = multer({ dest: "uploads/" });
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const filePath = req.file.path;
  const fileExt = req.file.originalname.split(".").pop().toLowerCase();
  let results = [];

  try {
    if (fileExt === "csv") {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath).pipe(csv())
          .on("data", (data) => data.email && results.push({ name: data.name, email: data.email }))
          .on("end", resolve).on("error", reject);
      });
    } else {
      const workbook = XLSX.readFile(filePath);
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      
      console.log("Raw Data First Row:", data.length > 0 ? JSON.stringify(data[0]) : "Empty");
      results = data.map(r => {
        const emailKey = Object.keys(r).find(k => k.toLowerCase() === "email");
        const nameKey = Object.keys(r).find(k => k.toLowerCase() === "name");
        return {
          name: nameKey ? r[nameKey] : "Unknown",
          email: emailKey ? r[emailKey] : null
        };
      }).filter(r => r.email);
      console.log(`Filtered Results: ${results.length}`);
    }

    console.log(`Processing ${results.length} contacts...`);
    for (let c of results) {
      if (c.email) {
        await Contact.updateOne({ email: c.email }, { $setOnInsert: { ...c, stage: "new" } }, { upsert: true });
      }
    }
    fs.unlinkSync(filePath);
    console.log(`Upload complete. Total: ${results.length}`);
    res.json({ message: "Uploaded", count: results.length });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Fail" });
  }
});

// Campaign Logic Extracted for reuse
async function runOutreach() {
  console.log("Outreach sequence triggered");
  const welcomeTemplate = await Template.findOne({ order: 0 });
  if (!welcomeTemplate) {
    throw new Error("Welcome template (order 0) not found in DB!");
  }

  const contacts = await Contact.find({ stage: "new" });
  console.log(`Found ${contacts.length} contacts in 'new' stage`);

  const results = await Promise.all(contacts.map(async (contact) => {
    try {
      const html = fillTemplate(welcomeTemplate.htmlBody, { name: contact.name });
      const subject = fillTemplate(welcomeTemplate.subject, { name: contact.name });
      
      const result = await sendEmail({
        to: contact.email,
        subject: subject,
        body: html,
        isHtml: true
      });

      if (!result.success) throw new Error(result.error);

      contact.stage = "contacted";
      contact.lastSentAt = new Date();
      contact.nextFollowUpAt = new Date(Date.now() + (welcomeTemplate.delayDays || 1) * 24 * 60 * 60 * 1000);
      await contact.save();

      await EmailLog.create({
        contactId: contact._id,
        templateId: welcomeTemplate._id,
        sentAt: new Date(),
        status: "sent"
      });
      return { success: true };
    } catch (err) {
      console.error(`Failed to send to ${contact.email}:`, err.message);
      await EmailLog.create({
        contactId: contact._id,
        templateId: welcomeTemplate._id,
        sentAt: new Date(),
        status: "failed",
        error: err.message
      });
      return { success: false };
    }
  }));

  const sentCount = results.filter(r => r.success).length;
  return sentCount;
}

// Campaign Controls
app.post("/launch", async (req, res) => {
  try {
    const contactsCount = await Contact.countDocuments({ stage: "new" });
    if (contactsCount === 0) {
      return res.status(400).json({ error: "No new contacts to email. Please upload a file first." });
    }
    
    // Trigger in background to avoid timeout
    runOutreach().then(sent => {
      console.log(`Background outreach finished. Sent: ${sent}`);
    }).catch(err => {
      console.error("Background outreach error:", err);
    });

    res.json({ message: "Campaign started in background.", count: contactsCount });
  } catch (err) {
    console.error("Launch Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/run-automation", async (req, res) => {
  try {
    console.log("Triggering full automation run...");
    const outreachSent = await runOutreach();
    await runScheduler(); // Run follow-up logic immediately
    res.json({ 
      message: "Automation run complete", 
      outreachCount: outreachSent 
    });
  } catch (err) {
    console.error("Automation Run Error:", err);
    res.status(500).json({ error: err.message });
  }
});


app.post("/mark-replied/:email", async (req, res) => {
  const contact = await Contact.findOne({ email: req.params.email });
  if (!contact) return res.status(404).json({ error: "Contact not found" });

  contact.replied = true;
  contact.sentiment = "positive";
  contact.repliedAt = new Date();
  contact.nextFollowUpAt = new Date();
  await contact.save();

  // Trigger immediate flow
  await runScheduler(contact._id.toString());
  res.json({ message: "Marked positive reply and triggered flow" });
});

app.post("/negative-reply/:email", async (req, res) => {
  const contact = await Contact.findOne({ email: req.params.email });
  if (!contact) return res.status(404).json({ error: "Contact not found" });

  contact.replied = true;
  contact.sentiment = "negative";
  contact.repliedAt = new Date();
  contact.nextFollowUpAt = new Date();
  await contact.save();

  // Trigger immediate flow
  await runScheduler(contact._id.toString());
  res.json({ message: "Marked negative reply and triggered flow" });
});

app.post("/opt-out/:email", async (req, res) => {
  await Contact.updateOne({ email: req.params.email }, { optedOut: true });
  res.json({ message: "Opted out" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
