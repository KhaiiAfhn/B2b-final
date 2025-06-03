export const generateInitialEmail = (currentUserProfile, matchedUserProfile) => {
      const myCompany = currentUserProfile.company_name || "[Your Company Name]";
      const theirCompany = matchedUserProfile.company_name || "[Their Company Name]";
      const myIndustry = currentUserProfile.industry || "[Your Industry]";
      const theirIndustry = matchedUserProfile.industry || "[Their Industry]";
      const myLookingFor = (currentUserProfile.looking_for || []).join(', ') || "new opportunities";
      const theirLookingFor = (matchedUserProfile.looking_for || []).join(', ') || "potential collaborations";
      const currentUserEmail = currentUserProfile.email || "[Your Email]";

      return `Subject: Exploring Synergies: ${myCompany} & ${theirCompany}

Dear ${theirCompany} Team,

My name is [Your Name] from ${myCompany}. We are a company in the ${myIndustry} sector, currently seeking ${myLookingFor}.

I came across your profile on B2B Connect and was impressed by your work in ${theirIndustry}, particularly your focus on ${theirLookingFor}. I believe there could be some exciting potential for collaboration between our companies.

Would you be open to a brief virtual coffee chat next week to explore how we might be able to support each other's goals?

Looking forward to hearing from you.

Best regards,

[Your Name]
[Your Title]
${myCompany}
${currentUserEmail} 
[Your Phone Number (Optional)]`;
    };
