// Question bank for the DFT SJT Mock Paper.
// Paper 1 = Q1–32 (standard), Paper 2 = Q33–64 (harder), Paper 3 = Q65–96 (harder), Paper 4 = Q97–128 (advanced), Paper 5 = Q129–160 (advanced).
// Each item: t = type, d = domain, g = theme, a = archetype, k = key (in authoring order),
// s = scenario, o = [option, justification] pairs, tk = takeaway.
// Options are shown in a fixed shuffled order (see the end of this file), and each key is remapped to match.
const L = "ABCDEFGH";
const DOMAINS = {I:"Professional integrity", P:"Coping with pressure", E:"Empathy & communication", T:"Working in a team"};
const TYPES = {rank:"Ranking · actions", consider:"Ranking · considerations", best3:"Best three of eight"};
const PROMPTS = {
  rank:"Rank in order the following actions in response to this situation (1 = Most appropriate; 5 = Least appropriate).",
  consider:"Rank in order the importance of the following considerations in deciding how to respond (1 = Most important; 5 = Least important).",
  best3:"Choose the THREE most appropriate actions to take in this situation."
};
const THEMES = {
  C:"Candour & your own errors", R:"Raising concerns about colleagues", K:"Consent & capacity",
  F:"Confidentiality & information", S:"Safeguarding & vulnerable patients", W:"Working within competence & safe conditions",
  M:"Communication & complaints", P:"Prioritising & workload", T:"Team relationships & feedback",
  H:"Health & wellbeing", I:"Probity: honesty, records & rules", N:"Money, NHS & private care"
};

// ---- Rewritten September 2026 so every option is plausible. All 96 keys reviewed by an expert panel (28 Sept 2026), then re-checked by a panel trained against the official papers (30 Sept 2026). ----
const RW_1_1 = [
 {
  "t": "rank",
  "d": "I",
  "a": "Colleague dishonesty",
  "k": "ABECD",
  "s": "The evening before a mandatory study day, Tom, a fellow FD on your scheme, messages you. He has just remembered a family wedding and asks you to sign the attendance register for him. He says ‘everyone does it’ and he’ll catch up from your notes. You get on well and sit next to each other at study days.",
  "o": [
   [
    "Say you can’t sign for him, and suggest he emails the TPD tonight to explain and ask what he can do.",
    "Declines to collude (Standard 9.1) and points Tom to the TPD, who can authorise the absence, so he can put it right himself."
   ],
   [
    "Say you can’t sign for him, and offer to share your notes and the slides with him after the day.",
    "A clear refusal that supports his learning, though it does nothing about the unauthorised absence itself, which D addresses."
   ],
   [
    "Offer to tell the course lead when you sign in that Tom is away for a family event, so it is recorded.",
    "Truthful, but it speaks for Tom to the course lead rather than the TPD and takes over a matter he should raise himself."
   ],
   [
    "Let the TPD know at the study day that Tom asked you to sign the register on his behalf.",
    "Honest, but reporting his request before Tom has had any chance to reconsider is disproportionate when a clear refusal would do."
   ],
   [
    "Say you’d rather not be involved, and that he needs to arrange his attendance himself.",
    "Refuses cleanly and hands the responsibility back to Tom, but unlike D and B it gives him no route forward or support."
   ]
  ],
  "tk": "Integrity items: decline to collude, then point the person to the right route so they can fix it themselves before anyone escalates."
 },
 {
  "t": "best3",
  "d": "E",
  "a": "Unhappy patient",
  "k": "ACG",
  "s": "Mrs Kaur, 78, comes back two weeks after you fitted her new upper complete denture. She says it keeps dropping, she’s too embarrassed to eat in front of her family, and ‘the old one was better’. She becomes tearful. This is only the third complete denture you have made.",
  "o": [
   [
    "Acknowledge how upsetting this is and ask her to describe when the denture drops.",
    "Empathy first, then the specific history you need to find the cause."
   ],
   [
    "Reassure her that most people take several weeks to adapt, and book a review soon.",
    "Often true, but it reassures before you have looked for a fault in your own work."
   ],
   [
    "Check the denture’s fit, extension and bite in her mouth before deciding anything.",
    "It is your treatment, so own the assessment and find the cause in her mouth before deciding anything."
   ],
   [
    "Ask her to bring her old denture next time so you can compare the two designs.",
    "Useful extra information, but it delays helping her today when you can examine now."
   ],
   [
    "Offer to remake the denture at no charge so that she has one she is happy with.",
    "Generous, but it commits to a solution before you know what is wrong."
   ],
   [
    "Tell her you will reline the denture next week, so that she goes home with a clear plan.",
    "Gives her a clear plan, but it commits to a treatment before you have examined the denture or taken advice on it."
   ],
   [
    "Ask your ES to look at the denture with you, as complete dentures are new to you.",
    "The stem flags your inexperience, so asking the ES to look at it with you is appropriate supervision (Standard 7.2), not handing over."
   ],
   [
    "Explain how she can give feedback through the practice process if she stays unhappy.",
    "Fair to offer eventually, but premature while you have not yet tried to resolve it."
   ]
  ],
  "tk": "Unhappy-patient items: acknowledge, examine, then agree a plan. Reassurance, free remakes and handovers all jump ahead of finding the cause."
 },
 {
  "t": "rank",
  "d": "T",
  "a": "Colleague struggling",
  "k": "ABECD",
  "s": "Your dental nurse, Amira, has seemed withdrawn lately and has arrived late three times this fortnight. Today she mixed the wrong material twice, though you noticed both times before use. Until recently her work has been excellent.",
  "o": [
   [
    "At the end of the session, speak to Amira privately, say she hasn’t seemed herself and ask how she is.",
    "Private, direct and curious. It opens the door to whatever sits behind the change before focusing on errors."
   ],
   [
    "At the end of the session, go through the mixing errors and lateness with Amira and agree how to avoid repeats.",
    "Private and direct, but leading with performance may miss the cause and make her less likely to open up."
   ],
   [
    "Mention to the practice manager that Amira doesn’t seem herself and ask if she knows of anything.",
    "Her line manager is a proper route for wellbeing concerns, but going to the manager before speaking to Amira goes behind her back and does nothing for today’s safety."
   ],
   [
    "Ask the practice manager if Amira could work with another clinician for a while to give her a change.",
    "Moves the problem rather than addressing it, and does nothing to find out what is wrong."
   ],
   [
    "Check each material yourself before use for the rest of the day, then see how she is next week.",
    "Keeps today’s patients safe after two mixing errors, but it puts off the conversation for a week. Still better than raising her with the practice manager before anyone has spoken to her."
   ]
  ],
  "tk": "Struggling-colleague items: a private conversation about how they are comes before performance feedback, managers or workarounds."
 },
 {
  "t": "rank",
  "d": "P",
  "a": "Running late",
  "k": "AECDB",
  "s": "It’s 11:40 and you’re 35 minutes behind after a difficult extraction. Your next patient is booked for a routine check-up. Reception tells you two people in the waiting room are complaining about the delay. Your associate colleague has a cancellation this morning.",
  "o": [
   [
    "Ask reception to tell waiting patients you are about 35 minutes behind and offer to rebook anyone who prefers.",
    "Informs everyone promptly and gives them a choice, without taking any time away from care."
   ],
   [
    "Keep the check-up focused, completing the history and examination but leaving oral hygiene advice for next time.",
    "Protects the essentials, but trims preventive care to catch up, which puts your schedule before the patient."
   ],
   [
    "Go to the waiting room yourself to apologise and explain before calling in your next patient.",
    "A personal touch, but it adds to the delay when reception could pass on the same message."
   ],
   [
    "After the session, ask your ES for advice on how long to book for surgical extractions.",
    "Addresses the cause, but does nothing for the patients waiting now, so it follows the immediate steps."
   ],
   [
    "Ask the practice manager whether your colleague could see one of your check-ups, if the patient agrees.",
    "Uses spare capacity and respects patient choice, but reception informing everyone should come first."
   ]
  ],
  "tk": "Time-pressure items: tell people now and offer choices; never trim care to catch up, and fix the cause afterwards."
 },
 {
  "t": "best3",
  "d": "I",
  "a": "Your own clinical error",
  "k": "ACD",
  "s": "While preparing a cavity on LL6, you realise your bur has nicked the side of the neighbouring tooth, LL7, leaving a small notch in the enamel. The patient is unaware. Your ES is in the next surgery.",
  "o": [
   [
    "Tell the patient what happened, apologise and explain what it means for LL7.",
    "Duty of candour: be open, prompt and specific. An apology is not an admission of liability."
   ],
   [
    "Ask your ES to look at LL7 before you say anything to the patient about it.",
    "Advice can help, but the notch is within your competence and this delays candour."
   ],
   [
    "Assess the notch and smooth or restore it as appropriate, with the patient’s consent.",
    "Limits the harm and puts it right, with the patient involved in the decision."
   ],
   [
    "Record accurately in the notes what happened, what you told the patient and what you did.",
    "A factual, contemporaneous record is part of being open about the error."
   ],
   [
    "Place a matrix band or wedge to protect LL7 while you finish preparing LL6.",
    "Sensible prevention of further damage, but it does not deal with the notch already made."
   ],
   [
    "Call your defence organisation for advice on wording before you write the notes.",
    "Reasonable later if needed, but not necessary before a simple factual note."
   ],
   [
    "Complete a significant event record so the practice can learn from the incident.",
    "Worthwhile, but less important than the patient, the repair and the notes."
   ],
   [
    "Discuss the incident at your next tutorial and reflect on it in your e-portfolio.",
    "Good learning, but it comes after the patient-facing steps and the record."
   ]
  ],
  "tk": "Own-error items: tell the patient, put it right, write it down. Advice, prevention and reflection are all sound but come second."
 },
 {
  "t": "consider",
  "d": "T",
  "a": "Supporting an upset colleague",
  "k": "ACDBE",
  "s": "At lunch, a fellow FD, Leah, tells you her ES criticised her this morning while a patient was in the chair. She’s very upset and says she’s thinking of leaving the scheme.",
  "o": [
   [
    "Leah’s wellbeing, and whether she feels safe and supported right now.",
    "The person in front of you, and what she needs today, matters most."
   ],
   [
    "Whether the ES’s feedback was clinically justified, however it was given.",
    "Relevant to what happened, but secondary while she is distressed and deciding."
   ],
   [
    "Who Leah could talk to, such as her TPD or a mentor, if she wishes.",
    "Practical support that points her to the right people, a close second."
   ],
   [
    "Whether she is making a big decision about leaving while she is upset.",
    "Important for her future, but it follows her wellbeing and her routes to support."
   ],
   [
    "Whether other FDs have had similar experiences with this ES recently.",
    "Could reveal a pattern, but it is speculative and does least to help Leah now."
   ]
  ],
  "tk": "Considerations items: the affected person first, their routes to support next, then decisions and facts; wider patterns last."
 },
 {
  "t": "rank",
  "d": "I",
  "a": "Targets versus patient interest",
  "k": "BDEAC",
  "s": "The practice manager tells you you’re behind on your UDA target. She suggests you book low-risk adults for three-monthly check-ups instead of the longer recall their risk supports, to boost your numbers. She says the practice has had a difficult year financially.",
  "o": [
   [
    "Ask your fellow FD how they manage recall intervals and targets at their practice.",
    "Harmless and may give ideas, but it leaves the manager’s request unanswered."
   ],
   [
    "Explain that you set recalls by each patient’s risk, and offer to look at other ways to raise your numbers.",
    "Answers her directly and constructively, keeping to the principle while taking her concern seriously."
   ],
   [
    "Contact the local NHS commissioner for guidance on whether her suggestion is acceptable.",
    "Premature: she has not had the chance to reconsider, and local routes have not been tried."
   ],
   [
    "Ask your ES for advice on appropriate ways to meet your UDA target this year.",
    "Sensible senior input, but less direct than responding to the manager yourself first."
   ],
   [
    "Tell her you will follow NICE recall guidance, and leave the target discussion to your ES.",
    "States the right principle, but disengages from her concern and hands the problem on."
   ]
  ],
  "tk": "Money-versus-patient items: explain the principle to the person asking and help with the real problem; external routes come last."
 },
 {
  "t": "best3",
  "d": "E",
  "a": "Anxious child",
  "k": "ACD",
  "s": "Josh, 7, is having a filling on a lower baby molar. He becomes very distressed when he sees the local anaesthetic. His father says, ‘Just get on with it, he’ll be fine.’ The appointment has 15 minutes left.",
  "o": [
   [
    "Pause and talk to Josh at his level to find out what is worrying him.",
    "Stop and explore before deciding how to proceed."
   ],
   [
    "Carry on as his father asks, with his father holding his hand for comfort.",
    "Respects the parent, but pushing on with a distressed child risks lasting anxiety."
   ],
   [
    "Explain to his father why a calm visit matters for Josh, and discuss the options.",
    "Takes the parent’s view seriously while speaking up for the child."
   ],
   [
    "Use tell-show-do to introduce the equipment gradually and build trust.",
    "A proven, patient-centred way to help him cope today."
   ],
   [
    "Apply topical anaesthetic and use distraction, then give the injection quickly.",
    "Helpful techniques, but it still pushes on before you know what worries him."
   ],
   [
    "Stop for today and rebook Josh for a short acclimatisation visit next week.",
    "May be right in the end, but premature before you have tried to settle him."
   ],
   [
    "Ask your ES to come in and help, as Josh is more anxious than you expected.",
    "Managing an anxious child is within your competence at this stage."
   ],
   [
    "Refer Josh to the community dental service for specialist paediatric care.",
    "Disproportionate before simple behaviour management has been tried."
   ]
  ],
  "tk": "Anxious-child items: pause, explore and adapt with the parent involved; pushing on, stopping early and referring all come too soon."
 }
];

const RW_1_2 = [
 {
  "t": "rank",
  "d": "T",
  "a": "Social media breach",
  "k": "CAEBD",
  "s": "You see that a dental nurse at your practice has posted a ‘before’ photo of a patient’s smile on her public Instagram, captioned ‘worst teeth I’ve seen all year’. Part of the patient’s face is visible. The post went up an hour ago, and she is on her break in the staff room.",
  "o": [
   [
    "Tell the practice manager today, as the post may be a data breach the practice needs to record and manage.",
    "Necessary, because the practice has data-protection duties, but asking the nurse to remove it herself stops the exposure sooner."
   ],
   [
    "Report the post to Instagram as a privacy violation, so the platform removes it as quickly as possible.",
    "It may get the image taken down, but platform reports can be slow and the nurse is never made aware of the problem."
   ],
   [
    "Speak to the nurse privately now, explain the confidentiality problem and ask her to delete the post straight away.",
    "She is on site and can remove it in seconds, and a private word deals with the source directly and respectfully."
   ],
   [
    "Refer the nurse to the GDC, as posting an identifiable patient image breaches the standards she is registered under.",
    "It may become appropriate if she refuses or repeats it, but as a first step it skips quicker local routes to removal."
   ],
   [
    "Mention it to your ES and ask how they would like the conversation with the nurse to be handled.",
    "Reasonable support, but you can raise it with her yourself, and waiting for advice leaves the image up for longer."
   ]
  ],
  "tk": "Colleague confidentiality breaches: get the content removed through the person first, then let the practice meet its data duties before any regulator."
 },
 {
  "t": "best3",
  "d": "P",
  "a": "Your own wellbeing",
  "k": "ACF",
  "s": "A long-term relationship has recently ended. You’re sleeping badly and have fallen behind on your e-portfolio. Yesterday your nurse spotted a charting error you’d made, which you corrected straight away.",
  "o": [
   [
    "Let your ES know that personal pressures may currently be affecting your work.",
    "Your ES supervises your clinical work, so telling them lets them support you and keep an eye on patient safety."
   ],
   [
    "Ask the practice manager whether your list could be lighter for the next few weeks.",
    "A lighter list may help, but it is a supervision question for your ES, who should hear about the pressure first."
   ],
   [
    "Re-check all your own clinical notes at the end of each day until you feel back on form.",
    "After errors made while exhausted, checking your own work each day is a direct way to keep patients safe while you get support, alongside telling your ES."
   ],
   [
    "Book time with your TPD to talk about your circumstances and the support available.",
    "The TPD can help with personal circumstances, but with your ES already told this largely duplicates that conversation. It becomes the next step if you need more support or flexibility."
   ],
   [
    "Block out time at weekends to bring your e-portfolio back up to date.",
    "Proactive, but giving up rest when poor sleep is part of the problem risks making things worse."
   ],
   [
    "See your GP about your sleep, or contact a practitioner health support service.",
    "Looking after your own health is part of keeping patients safe, and specialist support is available."
   ],
   [
    "Take a few days of annual leave to rest before you fall further behind.",
    "Rest may help briefly, but nothing changes on your return and your trainers remain unaware."
   ],
   [
    "Explain your situation to your nurse so she can flag anything that looks wrong.",
    "Kindly meant, but it places a supervisory role on a colleague instead of your ES."
   ]
  ],
  "tk": "Personal-pressure items: tell your ES, protect patients while you are struggling, and get health support. Giving up your rest or leaning on a colleague only postpones the problem."
 },
 {
  "t": "rank",
  "d": "P",
  "a": "Beyond your competence",
  "k": "BEADC",
  "s": "Your ES is on annual leave this week. A patient arrives for a surgical extraction of a lower wisdom tooth, which your ES booked for you, saying you’d ‘be fine’. You’ve watched this procedure twice and never done one. An experienced associate is working in the next surgery.",
  "o": [
   [
    "Phone your ES on leave to check whether they still want you to go ahead today.",
    "You get advice, but your ES cannot supervise from holiday, so it doesn’t solve the problem of support in the room."
   ],
   [
    "Ask the associate if they can supervise you directly, in the room, for this extraction.",
    "Uses the senior support on site, so the patient can be treated today and you learn safely."
   ],
   [
    "Go ahead, having asked the associate to be ready to step in if you run into difficulty.",
    "You would still start a procedure you’ve never done unsupervised, and help after a complication may come too late."
   ],
   [
    "Explain your limited experience to the patient and let them decide whether to proceed today.",
    "Honest, but it hands a judgement about your competence to the patient, who may choose to go ahead."
   ],
   [
    "Apologise to the patient and rebook the extraction for when your ES is back to supervise.",
    "Safe and honest, but it delays the patient’s treatment when suitable supervision may be next door."
   ]
  ],
  "tk": "Competence items: seek supervision on site first; rebook if there is none. Neither your ES’s confidence nor the patient’s consent makes an unsupervised first attempt safe."
 },
 {
  "t": "best3",
  "d": "I",
  "a": "Safeguarding",
  "k": "BDG",
  "s": "Ella, 6, comes with her mother for an emergency appointment with toothache. She has several untreated decayed teeth and has missed three of her last four appointments. You notice finger-shaped bruises on her upper arm. When you ask about them, Ella says she ‘fell over’.",
  "o": [
   [
    "Ask her mother, calmly and without accusation, how Ella came to have the bruises.",
    "Well meant, but it moves towards investigating, and may put Ella at more risk before a referral is considered."
   ],
   [
    "Write a factual note of the bruising, its site and size, and exactly what Ella said.",
    "Accurate, contemporaneous records are essential for any safeguarding decision that follows."
   ],
   [
    "Phone the local children’s social care team yourself before Ella leaves the practice.",
    "A referral may well follow, but the practice safeguarding lead should normally be involved first unless there is immediate danger."
   ],
   [
    "Give Ella the treatment she needs today to relieve her toothache.",
    "Her immediate clinical need still comes first, whatever else happens."
   ],
   [
    "Book a review in two weeks so you can see whether the bruising has resolved.",
    "Monitoring sounds cautious, but it delays acting on a concern that needs discussing now."
   ],
   [
    "Agree a plan with her mother for getting Ella’s missed dental care back on track.",
    "Useful for dental neglect, but it doesn’t address the bruising, which is the more serious concern."
   ],
   [
    "Talk your concerns through with the practice safeguarding lead before the end of the day.",
    "Follows the local procedure promptly and brings in experienced judgement on whether to refer."
   ],
   [
    "Check Ella’s records and ask colleagues whether anyone has noticed concerns before.",
    "Context can help, but gathering it yourself edges into investigating and delays the proper route."
   ]
  ],
  "tk": "Safeguarding items: treat, record and raise it through the safeguarding lead the same day. Questioning parents, monitoring or gathering evidence yourself all delay the proper route."
 },
 {
  "t": "rank",
  "d": "E",
  "a": "Unnecessary treatment request",
  "k": "BECAD",
  "s": "Mr Adeyemi, 35, has an upper front tooth that has darkened since a sports injury years ago. Tests show it is otherwise healthy. He asks you to take it out and replace it with an implant, as a friend had this done. He says he has researched implants and wants a ‘permanent fix’.",
  "o": [
   [
    "Refer him to a specialist for an implant assessment, since that is what he has asked for.",
    "Respects his request, but passes on the removal of a healthy tooth without discussing why he wants it or the alternatives."
   ],
   [
    "Ask what bothers him most about the tooth and what result he is hoping for.",
    "Exploring his concerns first shapes everything that follows, including which options will satisfy him."
   ],
   [
    "Recommend internal whitening, explaining that removing a healthy tooth isn’t in his interests.",
    "Clinically sound, but it advises before you understand his concerns and narrows his choice to one option."
   ],
   [
    "Agree to plan the extraction and implant, giving him a two-week cooling-off period first.",
    "A cooling-off period helps, but it commits to irreversible treatment of a healthy tooth before an informed discussion."
   ],
   [
    "Talk him through the options, from whitening to a veneer or crown, with their risks and costs.",
    "Informed choice is essential, and works best once you understand what he is trying to achieve."
   ]
  ],
  "tk": "Cosmetic-request items: explore what the patient wants, then give balanced options. Recommending too early is better than going along with irreversible treatment of healthy tissue."
 },
 {
  "t": "best3",
  "d": "P",
  "a": "Medical emergency",
  "k": "BDF",
  "s": "You’re midway through root canal treatment when the receptionist rushes in to say a patient in the waiting room has collapsed. Your ES is with a patient in the next surgery. Your nurse is with you.",
  "o": [
   [
    "Ask the receptionist whether the patient is conscious and breathing before you decide whether to go.",
    "Information helps, but a collapse needs a clinician to assess it, and asking first delays your response."
   ],
   [
    "Remove your instruments, sit your patient up and ask your nurse to stay with them.",
    "A quick, safe pause lets you leave without abandoning your current patient."
   ],
   [
    "Place a temporary dressing in the tooth first, so the canal isn’t left open while you’re away.",
    "Good practice normally, but it costs minutes that matter more to the collapsed patient."
   ],
   [
    "Go to the collapsed patient at once and assess them using the ABCDE approach.",
    "Prompt assessment by a trained clinician is the immediate priority."
   ],
   [
    "Send your nurse to assess the patient while you make your own patient safe.",
    "Nurses are trained in emergencies, but you are the clinician and your assessment shouldn’t be delegated."
   ],
   [
    "Ask the receptionist to bring the emergency kit and oxygen, and to alert your ES.",
    "Gets the equipment and help on the way, so you aren’t managing the emergency alone."
   ],
   [
    "Ask the receptionist to pull up the patient’s medical history from the records system.",
    "Useful later, but it takes a pair of hands away from fetching equipment and help."
   ],
   [
    "Ask the receptionist to move the other patients out of the waiting room for privacy.",
    "Protects dignity, but it can wait until the kit and help are on their way."
   ]
  ],
  "tk": "Emergency items: make your patient safe briefly, respond yourself, and get the kit and help moving. Anything else, however sensible, comes after."
 },
 {
  "t": "rank",
  "d": "T",
  "a": "Feedback about you",
  "k": "CEDAB",
  "s": "Your interim multi-source feedback (MSF) includes an anonymous comment that you ‘can be abrupt with nurses when running late’. You’re surprised; you thought you got on well with everyone.",
  "o": [
   [
    "Apologise to the nursing team at the next practice meeting for any times you’ve been abrupt.",
    "Well meant, but a group apology before you understand the issue is unfocused and may make colleagues uncomfortable."
   ],
   [
    "Ask the practice manager which of the nurses has mentioned you being abrupt, so that you can talk to them about it.",
    "It seeks context, but it looks like tracing the source of anonymous feedback and goes to the wrong person."
   ],
   [
    "Ask your own nurse for honest feedback on how you come across when you’re running late.",
    "Owns the problem directly and gets specific detail from someone who sees you under pressure, which is what makes change possible."
   ],
   [
    "Review how you schedule and pace your lists, so that you run late less often.",
    "Addresses a trigger, but not your manner itself, which can still slip whenever you are under pressure."
   ],
   [
    "Reflect on when you may have seemed abrupt, and discuss the feedback with your ES.",
    "Accepts the feedback and involves the person best placed to support your development, a close second to seeking the specifics yourself."
   ]
  ],
  "tk": "Feedback items: seek specifics yourself, then reflect and discuss with your ES. Fixing only the trigger or apologising broadly comes later; tracing the source comes last."
 },
 {
  "t": "consider",
  "d": "E",
  "a": "Consent and capacity",
  "k": "CEADB",
  "s": "You need to tell Mr Hughes, 82, that his lower molar can’t be saved and should be taken out. He lives alone, is anxious about dental treatment and has mild memory problems. His daughter usually comes with him but isn’t here today.",
  "o": [
   [
    "Whether he would like his daughter involved in discussing the decision.",
    "Supporting his decision in the way he prefers matters, but it is his choice, and it follows his understanding and priorities."
   ],
   [
    "How the extraction could be timed so that his daughter is able to come with him.",
    "A helpful practical point, but it can be sorted out once he has decided."
   ],
   [
    "Whether he can understand, retain and weigh up the information you give him.",
    "Capacity is presumed, but valid consent depends on him understanding and weighing the information."
   ],
   [
    "How you can help him manage his anxiety about having the tooth out.",
    "Important for his care, but it matters most once a decision has been made about the treatment itself."
   ],
   [
    "What matters most to him about the tooth and the treatment options.",
    "Central to a patient-centred decision, and very close to the top."
   ]
  ],
  "tk": "Consent items: understanding comes first, then his values and how he wants to decide; comfort and logistics follow."
 }
];

const RW_1_3 = [
 {
  "t": "rank",
  "d": "I",
  "a": "Impaired colleague",
  "k": "ABCDE",
  "s": "At 2pm you notice that an associate, Dr Moss, smells strongly of alcohol after coming back from lunch, and her speech seems slightly slurred. She mentioned earlier that she was going to a family birthday lunch. Her next patient is in the waiting room. Your ES is out today; the practice manager is on site.",
  "o": [
   [
    "Speak to Dr Moss privately, say what you’ve noticed, and suggest she doesn’t treat anyone this afternoon.",
    "Stops the immediate risk quickly and discreetly, and gives her the chance to step back herself before others are involved."
   ],
   [
    "Tell the practice manager now, so Dr Moss’s afternoon patients can be rebooked or seen by others.",
    "Essential to secure the afternoon list, but it comes just after a direct word with her, which is quicker and fairer to her."
   ],
   [
    "Phone your ES, who is out today, to explain what you’ve noticed and ask how they’d like you to handle it.",
    "Reasonable advice to seek, but it delays action on site when the patient is already waiting and the manager is present."
   ],
   [
    "Contact the GDC for advice on how to report a colleague who may be impaired by alcohol at work.",
    "Premature before local steps and does nothing for this afternoon’s patients, though unlike E it does not let unsafe treatment go ahead."
   ],
   [
    "Ask Dr Moss’s nurse to let you know straight away if anything seems wrong during her next appointment.",
    "Knowingly lets a possibly impaired clinician treat and shifts responsibility to the nurse, so harm must happen before anyone acts."
   ]
  ],
  "tk": "Possible impairment: act on the immediate risk yourself, privately and promptly, before seeking advice or reporting further."
 },
 {
  "t": "best3",
  "d": "E",
  "a": "Relative asking for information",
  "k": "BEG",
  "s": "A man phones saying he’s the husband of your patient, Mrs Ellis. He wants to know what treatment she had yesterday and what it cost, as ‘the bill is coming out of our joint account’. There is nothing in her records about sharing information with anyone.",
  "o": [
   [
    "Ask him to confirm her date of birth and address, so you can check he is who he says he is.",
    "Confirming his identity doesn’t give him a right to her information; only her consent does."
   ],
   [
    "Explain that you can’t share any details of her care, including costs, without her consent.",
    "Sets out the key principle clearly, and makes plain that cost is part of her confidential record."
   ],
   [
    "Confirm that Mrs Ellis is registered here, but explain that you can’t discuss her treatment.",
    "Feels like a helpful compromise, but confirming that she is a patient is itself a disclosure."
   ],
   [
    "Suggest he looks at the practice’s published fee list, which shows the usual cost of treatments.",
    "Not a breach in itself, but it sidesteps the real issue and may let him infer what she had done."
   ],
   [
    "Offer to pass on a message asking Mrs Ellis to contact the practice or talk to him herself.",
    "Gives him a constructive way forward while leaving the decision to share with her."
   ],
   [
    "Transfer him to the practice manager, as questions about bills are usually dealt with there.",
    "Moves the call rather than resolving it; the same confidentiality rule applies whoever answers."
   ],
   [
    "Acknowledge his worry about the bill, and explain the same rules apply to every patient’s family.",
    "Keeps the call courteous and makes the refusal feel less personal, which helps preserve trust."
   ],
   [
    "Ask him to put his request in writing, so the practice can respond to it formally.",
    "Sounds procedural, but a written request from him still can’t be answered without her consent."
   ]
  ],
  "tk": "Relatives asking for details: confidentiality covers costs too, so decline kindly and route the decision back to the patient."
 },
 {
  "t": "rank",
  "d": "P",
  "a": "Colleague offloading work",
  "k": "CEBAD",
  "s": "The other FD at your practice, Sam, often leaves before sorting his lab work and asks you to ‘just make sure it’s gone off’. It now happens most days, and you’ve missed your lunch break twice this week. Sam seems to get on well with everyone and may not realise the effect.",
  "o": [
   [
    "Keep sending it for now so patients aren’t delayed, and raise it with Sam when things are quieter.",
    "Keeps patients’ work moving, but it postpones the conversation indefinitely at the cost of your breaks, so the pattern continues."
   ],
   [
    "Ask the practice manager to set up a lab checklist so each clinician signs off their own cases.",
    "A constructive, blame-free system fix that also improves lab tracking, though it goes to the manager before a direct word with Sam."
   ],
   [
    "Speak to Sam privately, explain the effect on your workload, and agree he’ll send his own lab work.",
    "Direct and fair, and it deals with the cause with the person responsible before anyone else is involved."
   ],
   [
    "Stop checking his lab work, and leave him a note saying you no longer have time to do it.",
    "Honest, but a note may be missed, and patients’ lab work could fall through the gap in the meantime."
   ],
   [
    "Ask your ES for advice on how best to raise the issue with Sam without spoiling your relationship.",
    "Sensible support to seek, but slightly less direct than simply having the conversation yourself."
   ]
  ],
  "tk": "Workload creep: raise it with the colleague first; giving up your own time only delays the fix, and withdrawing abruptly risks patients."
 },
 {
  "t": "best3",
  "d": "T",
  "a": "Challenge from the team",
  "k": "BDG",
  "s": "As you prepare to give an inferior alveolar nerve block, your nurse quietly says she thinks the medical history mentions an allergy to the anaesthetic you’ve chosen. You’re fairly sure she’s wrong, and you’re running 20 minutes late.",
  "o": [
   [
    "Switch to a different anaesthetic to be safe, and look at the history after the appointment.",
    "Pragmatic, but you still don’t know what the allergy is, and the alternative might not be safe either."
   ],
   [
    "Pause before injecting and read the medical history yourself to check the allergy entry.",
    "Resolves the safety question quickly, and as the treating clinician the check is yours to make."
   ],
   [
    "Ask the nurse to check the history for you while you finish preparing the syringe.",
    "Quick, but it passes your responsibility to her and keeps treatment moving before the answer is known."
   ],
   [
    "Thank the nurse for raising it, whatever the history turns out to say.",
    "Reinforces a team where people feel safe to speak up, which matters beyond this patient."
   ],
   [
    "Ask your ES to review the history and advise whether it’s safe to go ahead.",
    "Checking a history entry is within your competence, so involving your ES adds delay without adding safety."
   ],
   [
    "Explain briefly to the nurse why you believe the history doesn’t mention an allergy.",
    "Opens a dialogue, but discussing it doesn’t settle the question the way checking the record does."
   ],
   [
    "Ask the patient whether they’ve ever had a reaction to a dental anaesthetic.",
    "Confirms the history with the patient, which catches errors or gaps in the written record."
   ],
   [
    "Suggest discussing how concerns are raised during treatment at the next team meeting.",
    "Useful learning, but it isn’t what this moment needs, and it may make the nurse feel she erred."
   ]
  ],
  "tk": "When a team member raises a safety concern: check it yourself now, confirm with the patient, and thank them for speaking up."
 },
 {
  "t": "rank",
  "d": "E",
  "a": "Patient refusing treatment",
  "k": "DBAEC",
  "s": "Mr Patel, 50, has a lower molar with irreversible pulpitis. You’ve recommended root canal treatment or extraction. He says he doesn’t want either and would rather ‘just take painkillers and see how it goes’. He seems a little anxious.",
  "o": [
   [
    "Record his decision, the options you discussed and the risks you explained in his notes.",
    "Records a properly informed refusal and the risks explained (Standard 4.1), which is more clearly appropriate than B’s misleading offer."
   ],
   [
    "Explain the likely course of the tooth without treatment, and that he can change his mind at any time.",
    "Makes sure any refusal is properly informed, and keeps the door open, once you understand his concerns."
   ],
   [
    "Prescribe antibiotics in case it flares up, alongside the painkillers he’s planning to take.",
    "Feels supportive, but antibiotics don’t treat pulpitis, so this is inappropriate prescribing to meet his wishes."
   ],
   [
    "Ask what’s behind his preference, such as cost, anxiety or a bad experience in the past.",
    "Understanding his reasons comes first, as it often reveals a concern you can address."
   ],
   [
    "Offer to remove the nerve today as a first step, to relieve the pain without committing to more.",
    "Pain relief is a fair aim, but saying it avoids committing to more is misleading, as the tooth would still need root canal treatment or extraction."
   ]
  ],
  "tk": "Refusal of treatment: explore reasons first, then inform and respect; don’t prescribe to fill the gap."
 },
 {
  "t": "best3",
  "d": "I",
  "a": "Gifts and boundaries",
  "k": "CEH",
  "s": "At the end of a long course of treatment, a patient hands you an envelope containing £300 in cash ‘for being so kind’. She has also sent you a friend request on your personal social media. She is clearly emotional and very grateful.",
  "o": [
   [
    "Accept the envelope for now, then ask the practice manager whether you’re allowed to keep it.",
    "Avoids an awkward moment, but once you’ve taken it you’ve accepted it; the question should be settled first."
   ],
   [
    "Suggest she puts the money towards a card or small treat for the whole team instead.",
    "Kindly meant, but it still invites a gift, and a sizeable one, just in another form."
   ],
   [
    "Thank her warmly and decline the cash, saying you’re just glad the treatment went well.",
    "Gracious, and avoids a large cash gift that could appear to influence your judgement."
   ],
   [
    "Accept the friend request, but set your privacy so she only sees a limited profile.",
    "Limits exposure, but you’ve still created a personal connection that blurs professional boundaries."
   ],
   [
    "Check the practice’s gifts policy, and record the offer in the gifts register.",
    "Transparency protects you and the practice, even when the gift is declined."
   ],
   [
    "Tell her you’ll need to ask your ES before you can say whether you can accept it.",
    "Defers a decision that is within your competence, and leaves the matter open when you could close it."
   ],
   [
    "Leave the friend request unanswered, so that she doesn’t feel rejected by a refusal.",
    "Avoids hurting her, but leaves the boundary unclear and the request pending."
   ],
   [
    "Decline the friend request, and explain kindly that you keep contact with patients professional.",
    "Sets a clear, kind boundary so the relationship stays professional."
   ]
  ],
  "tk": "Gifts and friend requests: decline kindly at the time, record the offer, and make the boundary clear rather than leaving it vague."
 },
 {
  "t": "rank",
  "d": "T",
  "a": "A colleague’s previous work",
  "k": "CAEDB",
  "s": "A new patient, who recently moved from another practice, has a crown on UR6 fitted six months ago. It has an open margin with decay underneath. She asks you, ‘Did my last dentist do a bad job?’",
  "o": [
   [
    "Offer, with her consent, to request her records from the previous practice to see the crown’s history.",
    "Gets the facts, with her consent, and supports continuity of care, so any later answer rests on evidence rather than speculation."
   ],
   [
    "Explain that open margins usually suggest a problem at fitting, so she may want to raise it with them.",
    "Sounds candid, but it speculates about a colleague’s work without knowing the circumstances, which is unfair to them."
   ],
   [
    "Describe what you can see today and the options, and say you can’t know how things were at fitting.",
    "Honest about the clinical facts while avoiding speculation about treatment you didn’t see."
   ],
   [
    "Say it’s difficult to tell, and move the conversation on to planning a replacement crown.",
    "Not untrue, but it leaves her question unanswered and may feel evasive about the problem she has."
   ],
   [
    "Suggest that if she has concerns, she raises them with the previous practice, who hold her full records.",
    "A correct and neutral route, but on its own it leaves her question unanswered and can read as hinting that the previous practice was at fault."
   ]
  ],
  "tk": "Another dentist’s work: be open about what you see now, don’t speculate about how it happened, and point concerns to the right route."
 },
 {
  "t": "best3",
  "d": "I",
  "a": "Portfolio honesty",
  "k": "ADG",
  "s": "Updating your e-portfolio, you realise you forgot to write up a case-based discussion (CbD) with your ES two months ago. A fellow FD suggests you write it up now and backdate it, saying ‘nobody checks the dates’.",
  "o": [
   [
    "Tell your ES you forgot to write it up, and ask how they’d like it recorded accurately.",
    "Open about the lapse, and gets guidance from the person who must validate the record."
   ],
   [
    "Check the e-portfolio guidance on how late entries should be dated before writing anything.",
    "Sensible, but it only answers the technical question; your ES still needs to know and validate it."
   ],
   [
    "Leave this CbD out, and arrange an extra one with your ES later in the month instead.",
    "Not dishonest, but it discards a genuine discussion that could simply be recorded accurately."
   ],
   [
    "Tell your fellow FD that backdating would misrepresent when the entry was actually made.",
    "A calm, proportionate challenge that upholds integrity without escalating a passing remark."
   ],
   [
    "Ask your fellow FD how they manage to keep their own portfolio up to date.",
    "Could be useful, but it doesn’t address either the missing entry or the suggestion to backdate."
   ],
   [
    "Mention your fellow FD’s suggestion to the TPD, in case others are doing the same.",
    "Premature escalation for a remark you can address directly, with no evidence anyone has backdated."
   ],
   [
    "Set aside a weekly slot for your e-portfolio, so entries are written up soon after events.",
    "Addresses the cause of the lapse, so it is less likely to happen again."
   ],
   [
    "Ask your ES to repeat the CbD on a new case this week, so your record stays current.",
    "Moves the problem rather than fixing it, and uses your ES’s time instead of recording the real discussion."
   ]
  ],
  "tk": "Late portfolio entries: record them accurately with your ES’s guidance, challenge backdating calmly, and fix the habit behind the lapse."
 }
];

const RW_1_4 = [
 {
  "t": "rank",
  "d": "E",
  "a": "Angry patient",
  "k": "ABDCE",
  "s": "You are part-way through a filling on an anaesthetised patient, with your nurse chairside, when another patient walks into your surgery. He is upset and raises his voice: his bridge has come out for the second time and he wants his money back ‘right now’.",
  "o": [
   [
    "Pause, tell him calmly that you want to hear this properly, and ask him to wait in reception until you’ve finished in about ten minutes.",
    "Keeps your current patient safe and their privacy intact, while you commit to hearing him out yourself."
   ],
   [
    "Ask your nurse to phone reception so the practice manager can take him somewhere private and listen until you’re free.",
    "Calms things quickly and gives him attention, but hands the first conversation to someone else rather than committing to it yourself."
   ],
   [
    "Step outside with him for a few minutes to understand what has happened, leaving your nurse with your patient.",
    "Well-meant and it engages with him honestly, but you leave an anaesthetised patient mid-treatment. Still better than promising an outcome nobody can yet justify."
   ],
   [
    "Explain calmly that you can’t discuss refunds, and that he’ll need to put his complaint in writing to the practice manager.",
    "Accurate about process and protects your patient, but it sounds like a brush-off and is likely to leave him angrier than acknowledging him first."
   ],
   [
    "Reassure him that the practice will sort out a replacement or refund, so he feels heard and leaves the surgery.",
    "Settles him quickly, but commits the practice to a refund before anyone knows why the bridge failed, and its aim is to get him out of the room rather than to address his concern."
   ]
  ],
  "tk": "With an upset patient mid-treatment, finish safely and commit to hearing him yourself; don’t promise outcomes or leave your patient to calm things down."
 },
 {
  "t": "best3",
  "d": "T",
  "a": "Working outside scope",
  "k": "BEG",
  "s": "You notice a trainee dental nurse taking radiographs of an associate’s patients, unsupervised. She hasn’t started any radiography training. She tells you the associate ‘asked her to, to save time’, and she seems anxious about getting it wrong.",
  "o": [
   [
    "Tell your ES what you’ve seen and ask how they would like you to handle it before saying anything.",
    "A reasonable source of support, but raising it with the people involved is within your competence and delaying lets the exposures continue."
   ],
   [
    "Explain kindly to the nurse that she shouldn’t take any more radiographs until she’s been trained.",
    "Stops the immediate risk to patients straight away, in a supportive way that doesn’t blame her."
   ],
   [
    "Offer to supervise her radiographs yourself until she can start her formal training.",
    "Supportive, but supervision doesn’t make an untrained person an appropriate operator, so the risk continues."
   ],
   [
    "Review the radiographs she has taken so far, to see whether any of them need to be retaken.",
    "Conscientious, but they aren’t your patients, and retaking images adds exposure before the practice has looked into it."
   ],
   [
    "Speak to the associate privately, explaining your concern that she hasn’t been trained yet.",
    "Addresses the cause directly with the person who asked her, which is the first rung of raising a concern."
   ],
   [
    "Suggest she asks the practice manager to book her onto a radiography course soon.",
    "Helps her development, but a future course doesn’t address what is happening now or the associate’s request."
   ],
   [
    "Let the practice’s radiation protection supervisor know, so procedures can be checked.",
    "Radiography is regulated, so the named lead needs to know and can make sure the practice’s procedures are followed."
   ],
   [
    "Raise it at the next practice meeting so all staff are reminded who may take radiographs.",
    "Useful team learning later, but it delays the private conversations that should come first and could embarrass her."
   ]
  ],
  "tk": "When someone works beyond their training, stop the risk now, speak privately to the person responsible, and involve the relevant lead; support can follow."
 },
 {
  "t": "rank",
  "d": "I",
  "a": "Records after a complaint",
  "k": "CEADB",
  "s": "A patient has complained that you didn’t warn her about the risk of numbness before a lower extraction. Checking your notes, you see you didn’t record the consent discussion, though you’re sure you had it. Your ES asks for a copy of the notes today so the complaint can be acknowledged.",
  "o": [
   [
    "Contact your defence organisation for advice before you send your ES anything.",
    "Sensible advice to seek, but it holds up a reasonable request from your ES when sending the notes and being open can happen now."
   ],
   [
    "Phone the patient to explain that you did discuss the risk, and that numbness is a recognised complication.",
    "Aims to resolve things quickly, but it bypasses the practice’s complaints process and may come across as defensive before the complaint is investigated."
   ],
   [
    "Send your ES the notes unchanged, and explain that you discussed numbness but didn’t record it.",
    "Open and prompt, so the complaint can be handled on accurate information."
   ],
   [
    "Ask your nurse whether she remembers the discussion, and include her account with the notes.",
    "Well-meant, but collecting witness accounts is for whoever investigates, and doing it yourself could look like shaping the evidence."
   ],
   [
    "Write a new, dated entry recording what you recall discussing, clearly marked as added after the complaint.",
    "An acceptable addendum if clearly labelled, but it is secondary to giving your ES the original record and an honest account."
   ]
  ],
  "tk": "After a complaint, hand over the original record with an honest account; a clearly labelled addendum is fine, but don’t delay, investigate or respond yourself."
 },
 {
  "t": "consider",
  "d": "P",
  "a": "Prioritising",
  "k": "BDAEC",
  "s": "It’s 5:30pm on Friday. A patient whose tooth you took out this morning has phoned to say it’s still bleeding. You also have three sets of notes to finish, a lab docket to sign for a crown fit on Monday, and a reflection your ES wants by the end of today. You have plans this evening.",
  "o": [
   [
    "Signing the lab docket so that Monday’s crown fit can go ahead as planned.",
    "Affects another patient’s care, but not urgently, and a missed docket can usually be recovered on Monday."
   ],
   [
    "Whether the bleeding needs you to see the patient or give advice this evening.",
    "Possible harm to a patient outranks everything else on the list."
   ],
   [
    "Leaving on time for the plans you have made for this evening.",
    "Your own time matters, but it comes after your patients and your professional obligations."
   ],
   [
    "Completing today’s clinical notes while the details are still accurate.",
    "Contemporaneous records are a professional duty and become less reliable with delay, so they sit just below the bleeding patient."
   ],
   [
    "Getting the reflection to your ES by the deadline they’ve set.",
    "A training task you can explain and renegotiate, so it sits below patient care and records."
   ]
  ],
  "tk": "When everything feels due at once, patient harm comes first, then contemporaneous records, then other patients’ care, then training, then you."
 },
 {
  "t": "rank",
  "d": "T",
  "a": "Harassment in the team",
  "k": "CEADB",
  "s": "Your nurse tells you in confidence that a senior associate often comments on her appearance in ways that make her uncomfortable. She asks you not to tell anyone yet, as she’s worried about losing her job.",
  "o": [
   [
    "Suggest she keeps a private note of the comments and dates, so she has a record if she decides to act.",
    "Practical and within her control, but on its own it only prepares for action rather than helping her find a way forward."
   ],
   [
    "Explain that you’ll need to let your ES know, as other staff may be affected too.",
    "A fair concern, but it breaks her confidence when she’s a competent adult in no immediate danger, and could cost you her trust."
   ],
   [
    "Listen, thank her for telling you, and talk through her options, including the practice’s policy.",
    "Respects her wishes while showing her the routes open to her, so she can decide what to do."
   ],
   [
    "Suggest she tells the associate directly, next time, that the comments make her uncomfortable.",
    "Speaking to the person is often the first step, but here it places the burden on the junior colleague, who is afraid of the consequences."
   ],
   [
    "Offer to go with her to the practice manager, whenever she feels ready to raise it.",
    "Useful practical support, but it follows from first understanding what she wants."
   ]
  ],
  "tk": "When a colleague discloses harassment in confidence, listen and explore her options first; don’t take over or share it against her wishes unless others are at risk."
 },
 {
  "t": "best3",
  "d": "E",
  "a": "NHS versus private",
  "k": "BDG",
  "s": "A patient needs a crown on a heavily filled lower molar. She asks whether an NHS crown is ‘worse’ than a private one, and mentions that money is tight at the moment.",
  "o": [
   [
    "Tell her which option you would choose for your own tooth, and explain why.",
    "Honest and personal, but it steers her towards your values rather than hers."
   ],
   [
    "Set out the NHS and private options, with their materials, costs and likely outcomes.",
    "Balanced information about every option is the basis of an informed choice."
   ],
   [
    "Mention that the practice offers monthly payment plans for private treatment.",
    "Useful information, but raised now it nudges her towards private care when she has said money is tight."
   ],
   [
    "Ask what matters most to her, such as appearance, durability or cost.",
    "Lets her own priorities guide the choice between clinically suitable options."
   ],
   [
    "Reassure her that an NHS crown will do the job just as well on a back tooth.",
    "Well-meant, but it pre-empts her priorities and glosses over real differences in materials."
   ],
   [
    "Ask the practice manager to go through the costs and payment options with her.",
    "Helpful for detail, but explaining the clinical differences and costs is your job as the treating dentist."
   ],
   [
    "Give her a written treatment plan showing the costs and which items are NHS or private.",
    "Written, itemised costs are required before treatment and let her compare the options at home."
   ],
   [
    "Fit a temporary crown today, so she has time to decide without the tooth being at risk.",
    "Protective in intent, but it starts irreversible treatment before she has made an informed choice."
   ]
  ],
  "tk": "With NHS versus private choices, give balanced information and written costs, and let the patient’s priorities decide, without any gentle steering."
 },
 {
  "t": "best3",
  "d": "P",
  "a": "Your own health",
  "k": "BDF",
  "s": "Clearing up after an extraction, you get a needlestick injury from a used needle. The patient is still in reception, you have three more patients booked this afternoon, and you feel embarrassed because it happened while you were re-sheathing by hand.",
  "o": [
   [
    "See your next patient, who is already waiting, then arrange assessment before the one after.",
    "Considerate to the patient waiting, but any post-exposure treatment is time-sensitive, so assessment shouldn’t wait."
   ],
   [
    "Encourage the wound to bleed, wash it under running water and cover it.",
    "Correct first aid, done straight away."
   ],
   [
    "Ask the patient yourself, before they leave, whether they’d consent to a blood test.",
    "Source testing matters, but the request should come from someone other than the injured person, to avoid pressure."
   ],
   [
    "Report it straight away to your ES or the practice’s designated person, and record it.",
    "Prompt reporting starts the practice’s sharps procedure and ensures the injury is recorded properly."
   ],
   [
    "Check the patient’s medical history for any known risk of bloodborne virus.",
    "Helpful to the risk assessment, but that assessment belongs to occupational health, not to you alone."
   ],
   [
    "Get urgent assessment via occupational health or A&amp;E, as the sharps policy sets out.",
    "A proper, urgent risk assessment, so that any treatment can be started early."
   ],
   [
    "Reflect on why you re-sheathed by hand, and discuss it at your next ES tutorial.",
    "Valuable learning, but it comes after the urgent steps for your own health."
   ],
   [
    "Phone NHS 111 for advice on whether you need post-exposure treatment.",
    "Gets some advice, but bypasses the practice’s sharps policy and its arranged route for urgent assessment."
   ]
  ],
  "tk": "After a sharps injury, first aid, prompt reporting and urgent assessment come before patients, reflection or self-assessment; embarrassment never justifies delay."
 },
 {
  "t": "rank",
  "d": "E",
  "a": "Young person’s consent",
  "k": "BDCEA",
  "s": "Maya, 15, comes in alone. She has chipped a front tooth and asks you to repair it today with a tooth-coloured filling. She doesn’t want her parents to know she’s been, as she thinks they’ll be angry.",
  "o": [
   [
    "Go ahead with the repair today, as a composite is low risk, reversible and she clearly wants it.",
    "Respects her wishes, but without checking she understands the risks and alternatives, her consent may not be valid."
   ],
   [
    "Check whether she understands the repair, its risks and the alternatives well enough to consent.",
    "Someone under 16 can consent if they are competent to, so checking this comes first."
   ],
   [
    "Ask whether she would be happy for you to phone a parent now, so they can give consent.",
    "Asks rather than breaches her confidence, but it assumes she needs a parent before checking whether she can decide herself."
   ],
   [
    "Encourage her to tell her parents, but explain her visit stays confidential if she can decide.",
    "Good practice that follows from assessing her competence, so it comes second."
   ],
   [
    "Smooth the sharp edge today, and book the filling for when a parent can come with her.",
    "Safe and helps her now, but it may override the choice of a competent young person without assessing her first."
   ]
  ],
  "tk": "With a young person attending alone, assess Gillick competence before anything else; involving parents is encouraged, not a precondition."
 }
];

const RW_2_1 = [
 {
  "t": "rank",
  "d": "P",
  "a": "When your supervisor is the problem",
  "k": "BDACE",
  "s": "For three weeks your ES has left the practice most afternoons to work at his other practice across town, leaving you as the only dentist on site. He says to phone him if there’s a problem. Last week a patient fainted and, although the team managed well, you felt out of your depth.",
  "o": [
   [
    "Ask the practice manager whether another dentist could be rostered on site for the afternoons your ES is away.",
    "Constructive, but it goes round your ES, who agreed the arrangement and is responsible for your supervision."
   ],
   [
    "Raise it privately with your ES, using last week’s fainting episode to explain why you need a dentist on site.",
    "Gives the person who made the arrangement a clear, concrete reason to change it, and the first chance to fix it."
   ],
   [
    "Keep to the phone arrangement for now, and ask your nurse to run a medical emergencies drill with you this week.",
    "Improves the team’s readiness, but leaves the gap in on-site supervision exactly as it was."
   ],
   [
    "Contact your TPD to discuss whether the supervision arrangements meet the requirements of the scheme.",
    "The right next step if talking to your ES doesn’t change things, since the TPD oversees supervision standards."
   ],
   [
    "Book only routine, low-risk patients into your afternoon lists until the supervision arrangements are reviewed.",
    "Well-meant caution, but it restricts patients’ access and works around the problem instead of raising it."
   ]
  ],
  "tk": "When supervision falls short, raise it with your ES before going round him to the manager or up to the TPD; team drills and cautious booking are sensible but leave the real gap open."
 },
 {
  "t": "best3",
  "d": "I",
  "a": "Request for a misleading letter",
  "k": "BEG",
  "s": "A patient asks you to write a letter for his travel insurer saying his broken tooth happened on holiday last month. His notes show he mentioned the fracture at a check-up before he travelled. He says the claim won’t be paid otherwise and he can’t afford the crown he needs.",
  "o": [
   [
    "Offer to reassess the tooth, in case the damage has changed since the check-up.",
    "Reasonable clinically, but the notes already settle the timeline, so it doesn’t change what the letter can say."
   ],
   [
    "Explain that any letter you write has to reflect what his records show.",
    "Sets the honest boundary clearly and calmly, without judging his motives."
   ],
   [
    "Explain that a misleading claim could expose you both to a fraud investigation.",
    "True, but it leads with consequences and can feel like a warning, when a plain boundary and a way forward serve him better."
   ],
   [
    "Ask your ES to review the notes and decide what the letter should say.",
    "Well within your competence to answer, and it hands on a decision that is yours to make."
   ],
   [
    "Talk through affordable ways to treat the tooth, including NHS options.",
    "Meets the real need behind the request, so he isn’t left choosing between honesty and treatment."
   ],
   [
    "Tell him you’ll check with your defence organisation before writing anything.",
    "Unnecessary here. The answer is clear, and the delay leaves him uncertain for no benefit."
   ],
   [
    "Record his request and your response accurately in his notes.",
    "A clear record protects you both if the claim is questioned later."
   ],
   [
    "Suggest he explains the timeline to the insurer himself and asks about cover.",
    "Honest, but it sends him off alone without help with the treatment he still needs."
   ]
  ],
  "tk": "Probity items: hold a clear, factual boundary, then pair it with real help and a good record; warnings, second opinions and extra checks feel prudent but add little."
 },
 {
  "t": "rank",
  "d": "E",
  "a": "Adult safeguarding with capacity",
  "k": "CDAEB",
  "s": "While you’re treating Ms Obi, 34, for a fractured incisor, she tells you her partner hit her and that it has happened before. She has capacity, asks you not to tell anyone, and is going home with him today. There are no children in the household.",
  "o": [
   [
    "Record her disclosure, her wishes and your discussion accurately in her notes after the appointment.",
    "Essential, but it comes after supporting her and agreeing next steps while she is still with you."
   ],
   [
    "Explain that, as she has been injured, you’ll need to let the safeguarding lead know, but it will stay confidential.",
    "Overrides a competent adult’s wishes when no one else is at risk and there is no immediate danger."
   ],
   [
    "Acknowledge what she has told you, ask whether she feels safe going home today, and offer abuse support details.",
    "Checks for immediate danger and supports her while fully respecting her choices."
   ],
   [
    "Ask whether she would agree to you discussing her situation with the practice safeguarding lead for advice.",
    "The right next step. It seeks support for her while keeping the decision with her."
   ],
   [
    "Encourage her to report the assault to the police today, and offer to make the call with her now.",
    "Supportive in intent, but it steers her towards a step she hasn’t chosen and may increase her risk."
   ]
  ],
  "tk": "Adult safeguarding: check immediate safety, support and seek consent before sharing; urging police involvement or sharing without agreement both erode a competent adult’s control."
 },
 {
  "t": "best3",
  "d": "P",
  "a": "Red-flag emergency by phone",
  "k": "BEH",
  "s": "At 4:45pm, with your last patient booked at 5pm, reception tells you someone has phoned about a rapidly spreading facial swelling that is making it hard to swallow. Your ES has gone home.",
  "o": [
   [
    "Ask the patient to come in now so you can examine the swelling before deciding.",
    "Feels helpful, but travelling to you delays the hospital care the symptoms already call for."
   ],
   [
    "Speak to the patient on the phone yourself to assess the urgency.",
    "Clinical triage is your responsibility and shouldn’t rest with reception."
   ],
   [
    "Phone your ES at home to check your plan before advising the patient.",
    "The need is clear and within your competence, so the call only adds delay."
   ],
   [
    "Phone the local maxillofacial team to let them know the patient is coming.",
    "Courteous, but not a priority. A&amp;E will triage and involve them as needed."
   ],
   [
    "Advise A&amp;E now, and 999 if breathing becomes difficult.",
    "A spreading swelling affecting swallowing may compromise the airway and needs hospital care."
   ],
   [
    "Offer the first emergency slot tomorrow, with advice to go to A&amp;E if it worsens.",
    "The safety net is right, but it waits for deterioration that has already begun."
   ],
   [
    "Ask your nurse to call the patient back and take a full medical history first.",
    "Useful information, but delegating it delays your own assessment and advice."
   ],
   [
    "Record the call and the advice you gave in the patient’s notes.",
    "Telephone advice on an emergency needs an accurate, timely record."
   ]
  ],
  "tk": "Red-flag calls: triage it yourself and send the patient to the right place now; seeing them first, waiting, or checking with others all feel careful but cost time."
 },
 {
  "t": "rank",
  "d": "I",
  "a": "Senior asks you to bend the rules",
  "k": "CAEDB",
  "s": "Your ES, who also owns the practice, asks you to split one patient’s course of treatment into two separate NHS claims so the practice earns more UDAs. You’re fairly sure this breaks the NHS regulations, but not certain. He says it’s ‘standard practice’ and nothing has been submitted yet.",
  "o": [
   [
    "Check the NHS regulations, or ask your defence organisation, to confirm whether splitting is allowed here.",
    "Sensible fact-checking, but it comes after giving your ES the chance to explain or reconsider."
   ],
   [
    "Report the practice to the NHS Counter Fraud Authority, as the request could amount to fraud.",
    "Premature while you’re unsure and nothing has been submitted; it skips the steps that could resolve it."
   ],
   [
    "Explain your concern privately to your ES, and ask him to show you where the rules allow it.",
    "Raises the concern directly with the person asking, and gives him a way to reconsider without confrontation."
   ],
   [
    "Ask the other associates how they handle courses like this, to see whether it really is standard.",
    "Gathers views, but others’ habits don’t show what the rules allow and it doesn’t resolve the claim."
   ],
   [
    "Contact your TPD for advice, as your ES is also the owner and the issue affects your training.",
    "The right escalation if the conversation and your checks don’t settle it, given his dual role."
   ]
  ],
  "tk": "When a senior asks you to bend the rules: raise it with them, check the facts yourself, then escalate; what colleagues do is not evidence, and external reports come later."
 },
 {
  "t": "consider",
  "d": "T",
  "a": "Discriminatory remark by a colleague",
  "k": "BDEAC",
  "s": "After a patient leaves, your nurse makes a derogatory remark about the patient’s ethnicity. No patients heard it. The nurse is well liked and has worked at the practice for 20 years; you’ve been there four months and rely on her every day.",
  "o": [
   [
    "Whether the practice has an equality policy, and who handles concerns about staff conduct.",
    "Useful for choosing the route if a private word isn’t enough, but it is procedural and follows the reasons to act."
   ],
   [
    "Your duty to challenge discriminatory behaviour, whatever the nurse’s seniority or popularity.",
    "The duty engaged directly here: discriminatory remarks must be challenged whatever the nurse’s seniority, so this is what makes you respond at all."
   ],
   [
    "How to keep a good working relationship with the nurse for the rest of your year.",
    "Relevant to how you raise it, but it shouldn’t decide whether you do."
   ],
   [
    "Whether attitudes like this could affect how patients from that background are treated.",
    "Important because such attitudes can shape care, but no patient heard this remark, so it reinforces the duty in D rather than replacing it."
   ],
   [
    "Whether this was a one-off remark or part of a pattern that others have noticed.",
    "Shapes how firmly to respond and whether to escalate, but not whether to act."
   ]
  ],
  "tk": "Discrimination items: patient impact and the duty to challenge come first; patterns, policies and relationships shape how you respond, not whether you do."
 },
 {
  "t": "best3",
  "d": "E",
  "a": "Capacity and consent",
  "k": "ACD",
  "s": "Mr Grant, 45, has a learning disability and lives in supported housing. He comes with a support worker to have a painful, unrestorable tooth extracted. When you explain the procedure, Mr Grant says ‘no’. The support worker says, ‘He always says no. Just go ahead, I’ll sign the form.’",
  "o": [
   [
    "Explain that the support worker can’t consent on Mr Grant’s behalf.",
    "Only the patient, or someone with legal authority, can consent, so the support worker’s offer to sign must be declined."
   ],
   [
    "Rebook a longer appointment and send easy-read information before then.",
    "Thoughtful, but it postpones helping him decide today while he is in pain."
   ],
   [
    "Ask the support worker how Mr Grant usually shows what he wants.",
    "Learning how he usually communicates is one of the practicable steps the law expects, and helps you understand what his ‘no’ means."
   ],
   [
    "Explore why Mr Grant is saying no, and explain again simply, using pictures.",
    "Capacity is presumed, so you take every practicable step to help him decide, starting with why he is saying no."
   ],
   [
    "Ask your ES to carry out the capacity assessment for this decision.",
    "Assessing capacity for treatment you’re providing is part of your own role, so handing it to your ES isn’t needed."
   ],
   [
    "Contact his GP to ask whether anyone holds a health and welfare LPA.",
    "Relevant later, but premature before you know whether he lacks capacity."
   ],
   [
    "If he lacks capacity, hold a best-interests meeting rather than proceed today.",
    "Premature and conditional: capacity hasn’t been assessed, the law needs a best-interests decision rather than a formal meeting, and waiting prolongs his pain."
   ],
   [
    "Refer him to the special care dental service for extraction under sedation.",
    "May be right eventually, but supporting his decision and assessing capacity come first."
   ]
  ],
  "tk": "Capacity items: presume capacity, support the patient to decide and follow the best-interests process; involving carers, GPs, seniors or specialists helps but doesn’t replace those steps."
 },
 {
  "t": "rank",
  "d": "P",
  "a": "Working while infectious",
  "k": "BDEAC",
  "s": "You wake up at 6am with vomiting and diarrhoea. You have a full list, including a patient who has taken a day off work for a long appointment. Your ES is already stretched covering a colleague’s leave.",
  "o": [
   [
    "Offer to work an extra session next week so that today’s patients can be seen sooner.",
    "Proactive and kind, but it gives up your own time and matters less than today’s arrangements."
   ],
   [
    "Phone the practice as soon as it opens to say you can’t come in, so patients can be contacted.",
    "Protects patients and staff from infection, and gives the team the most time to rearrange."
   ],
   [
    "Tell the practice you may be able to come in this afternoon if your symptoms settle by lunchtime.",
    "Well-meant, but you remain infectious for some time after symptoms stop, so it risks spreading it."
   ],
   [
    "Ask the practice to contact the long-appointment patient first, and offer them a priority slot.",
    "Reaches the patient most affected today and softens the impact on them, which matters more right now than notifying your training structures."
   ],
   [
    "Let your ES and TPD know about your absence, following your scheme’s sickness policy.",
    "A training requirement that keeps your supervisors informed, but it can wait until the patients affected today have been looked after."
   ]
  ],
  "tk": "Your-health items: report sickness early and properly, then soften the impact on patients; returning too soon or giving up your own time are well-meant but secondary or unsafe."
 }
];

const RW_2_2 = [
 {
  "t": "best3",
  "d": "T",
  "a": "Colleague at risk",
  "k": "ABD",
  "s": "At a study day, a fellow FD tells you they’ve felt hopeless for weeks and sometimes think everyone would be better off without them. They ask you not to tell anyone, as they’re worried it will affect their training. The session restarts in ten minutes.",
  "o": [
   [
    "Ask them directly whether they have had thoughts of ending their life and whether they have made any plans.",
    "Asking directly doesn’t increase risk, and you can’t judge how urgent this is until you know whether there is a plan."
   ],
   [
    "Encourage them to see their GP today, or to use urgent mental health services if they feel unsafe tonight.",
    "Matches the level of help to what they’ve told you, today rather than this week."
   ],
   [
    "Agree to keep it between the two of you for now, provided they book a GP appointment this week.",
    "Feels supportive and keeps them talking, but it promises a secrecy you may not be able to keep and lets help wait days."
   ],
   [
    "Tell them you’d need to involve others if you became worried about their safety, and explain why.",
    "Being honest about the limits of confidentiality now protects trust if you do have to act later."
   ],
   [
    "Suggest they talk to their ES in confidence, as the ES can arrange occupational health and time off.",
    "A sensible route for training support, but it doesn’t address their immediate safety, which comes first."
   ],
   [
    "Let them know you’ll contact the TPD today, so the scheme can put support in place for them.",
    "Open with them, but escalating to the scheme before you’ve assessed risk or sought their agreement skips steps with a competent adult."
   ],
   [
    "Give them the details of the NHS Practitioner Health service and ask them to self-refer this week.",
    "A good resource, but signposting alone leaves the timing to them when the urgency hasn’t been established."
   ],
   [
    "Offer to phone or message them each evening this week so they know someone is checking in.",
    "Kind, but it makes you their safety net instead of connecting them with professional help."
   ]
  ],
  "tk": "When a colleague discloses suicidal thoughts, ask directly, get them professional help today, and be honest about confidentiality; supportive delays and early escalation are the tempting traps."
 },
 {
  "t": "rank",
  "d": "I",
  "a": "Shortcut offered by a senior",
  "k": "CAEDB",
  "s": "Your ES is behind on your workplace-based assessments. He offers to sign off an observed assessment for a procedure you did alone last week, saying, ‘I trust you, and it’ll help us both catch up.’ Your interim review is in three weeks.",
  "o": [
   [
    "Suggest he assesses last week’s case as a case-based discussion instead, and book an observed one soon.",
    "An honest way to use the case and catch up, just below simply declining, since it still leaves the observed assessment to arrange."
   ],
   [
    "Decline, and email him afterwards summarising the e-portfolio rules so there’s a clear record for you both.",
    "Keeps you honest, but the formal record feels defensive towards a supervisor you can resolve this with in person."
   ],
   [
    "Thank him, explain that it needs to be observed, and suggest booking him in for your next similar case.",
    "Declines warmly, explains why, and fixes the backlog with him directly."
   ],
   [
    "Decline, then mention to your TPD at your interim review that your assessments are falling behind.",
    "The TPD may need to know about progress, but raising it there before trying to fix the backlog with your ES is premature."
   ],
   [
    "Decline, and ask the practice manager to block out regular assessment slots in his diary.",
    "Practical, but arranging your supervisor’s diary through someone else goes round him instead of agreeing a plan together."
   ]
  ],
  "tk": "When a senior offers a shortcut, decline and solve the underlying backlog with them directly before involving anyone else."
 },
 {
  "t": "best3",
  "d": "P",
  "a": "Equipment failure",
  "k": "ABD",
  "s": "At 8:30am your nurse tells you the autoclave has failed its daily test cycle. You have a full morning list and enough sterile instrument packs for about three patients.",
  "o": [
   [
    "Use the sterile packs you have for the patients with the most urgent clinical need this morning.",
    "Makes the safest, fairest use of a limited supply."
   ],
   [
    "Ask reception to contact later patients now, explain the problem and offer them new appointments.",
    "Keeps patients informed early and avoids wasted journeys."
   ],
   [
    "Ask your nurse to repeat the test cycle, and use the autoclave if it passes on the second run.",
    "Tempting, but one pass after a failure doesn’t show the machine is reliable; it needs checking before use."
   ],
   [
    "Report the failure to the decontamination lead or practice manager so an engineer is called.",
    "Deals with the cause so the problem doesn’t roll into tomorrow."
   ],
   [
    "Ask the practice manager to borrow sterile packs from a nearby practice to cover the morning.",
    "Resourceful, but it depends on another practice’s spare stock and traceability, whereas rebooking is certain."
   ],
   [
    "Cancel the whole morning list now so that no patients arrive to find their treatment delayed.",
    "Decisive, but it turns away urgent patients you have safe packs for."
   ],
   [
    "Ask your ES whether you should carry on with the list before you decide what to do.",
    "Reasonable to keep them informed, but prioritising a list with the packs you have is within your competence."
   ],
   [
    "Check the service logbook to see whether this fault has happened before and how it was fixed.",
    "Useful background for the engineer, but it’s investigating when patients and the repair need action first."
   ]
  ],
  "tk": "When equipment fails, work safely within what you have, tell patients early and get the fault fixed; re-testing, borrowing and blanket cancellation all feel sensible but are weaker."
 },
 {
  "t": "rank",
  "d": "E",
  "a": "Discrimination directed at you",
  "k": "CAEBD",
  "s": "A new patient, on meeting you, says she wants ‘an English dentist’ instead. The other two dentists are fully booked today. She is in considerable pain.",
  "o": [
   [
    "Offer her the next free slot with another dentist, while making clear that you can treat her today.",
    "Keeps same-day treatment on offer while respecting her right to decline you; the alternative is only the normal next slot, with no special accommodation."
   ],
   [
    "Ask the practice manager to speak to her, so the practice’s position comes from someone senior.",
    "Moves a conversation you can handle yourself, though it keeps the response consistent and doesn’t burden colleagues."
   ],
   [
    "Calmly say you’re a qualified dentist who can see her now, and ask if she’d like you to relieve her pain.",
    "Professional, centred on her clinical need, and doesn’t give way to the request."
   ],
   [
    "Ask a colleague to see her briefly over lunch, so she gets pain relief without any confrontation.",
    "Well meant, but it accommodates a discriminatory preference at a colleague’s and other patients’ expense."
   ],
   [
    "Afterwards, tell your ES what happened, how it affected you, and ask how the practice handles this.",
    "Gets you support and a consistent practice approach, but it happens afterwards and does nothing for her pain."
   ]
  ],
  "tk": "When a patient rejects you on discriminatory grounds, offer care calmly yourself and seek support afterwards; handing it to others, however kindly, accommodates the prejudice."
 },
 {
  "t": "best3",
  "d": "I",
  "a": "A colleague’s health and patient safety",
  "k": "ABD",
  "s": "A fellow FD tells you in confidence that they’ve recently been diagnosed with hepatitis B. They haven’t told anyone at work and are still doing extractions, because they feel well and are worried about losing their place on the scheme.",
  "o": [
   [
    "Encourage them to contact occupational health today for advice about their diagnosis and their work.",
    "Occupational health is the right source of advice on what they can safely do, and can support them."
   ],
   [
    "Explain that they need to stop exposure-prone procedures until occupational health has advised them.",
    "Protects patients straight away while they get proper advice."
   ],
   [
    "Suggest they ring their defence organisation to check their obligations before telling anyone at work.",
    "Not unreasonable, but it delays the clinical advice that protects patients, which comes first."
   ],
   [
    "Explain that if they don’t seek advice, you may have to raise your concern with their ES or TPD.",
    "Honest about your own duty while giving them the chance to act first."
   ],
   [
    "Suggest they avoid difficult extractions and double-glove until they have seen occupational health.",
    "Reduces some risk, but it’s a partial measure that lets exposure-prone work continue."
   ],
   [
    "Contact the TPD yourself today, so the scheme can make arrangements to protect their patients.",
    "Understandable, but it overrides their confidence before they’ve had the chance to seek advice themselves."
   ],
   [
    "Offer to look up the UKHSA guidance on blood-borne viruses with them so they know where they stand.",
    "Supportive, but reading guidance together is no substitute for individual advice from occupational health."
   ],
   [
    "Reassure them that a diagnosis like this rarely ends a dental career, so there’s no need to keep it quiet.",
    "May ease their fear, but it’s reassurance before the facts and doesn’t stop the risk to patients."
   ]
  ],
  "tk": "When a colleague has a blood-borne virus, get them to stop exposure-prone work and see occupational health, and be clear about when you’d escalate; partial precautions and early reporting both miss the balance."
 },
 {
  "t": "rank",
  "d": "T",
  "a": "When you’re the problem",
  "k": "DEABC",
  "s": "During a difficult extraction you snapped at your nurse, Beth, while the patient was in the chair. Afterwards Beth tells the practice manager she no longer wants to work with you.",
  "o": [
   [
    "Apologise to the patient at their next visit for the tense exchange during their extraction.",
    "Appropriate, but it comes after repairing things with Beth and understanding why it happened."
   ],
   [
    "Give Beth a few days of space before raising it, so she has time to feel less upset.",
    "Considerate in intent, but delay leaves the rift to harden and the practice manager waiting."
   ],
   [
    "Explain to the practice manager how stressful the extraction was, so she has the context first.",
    "Context matters, but offering it before you’ve apologised to Beth comes across as justifying yourself."
   ],
   [
    "Apologise to Beth privately, acknowledge how it affected her, and ask how you can work well together.",
    "Takes ownership and begins repairing the relationship directly with the person affected."
   ],
   [
    "Reflect on what happened and discuss ways of managing stress in difficult cases with your ES.",
    "Addresses the cause and shows insight, just after the direct apology."
   ]
  ],
  "tk": "When you are the problem, apologise to the person first, then deal with the cause; explaining the context before apologising reads as self-justification."
 },
 {
  "t": "best3",
  "d": "E",
  "a": "Language barrier with urgent news",
  "k": "AEF",
  "s": "A patient who speaks little English attends with her 12-year-old son, who is interpreting. You find a lesion that needs an urgent biopsy referral, and you need to explain this to her.",
  "o": [
   [
    "Arrange a telephone interpreter now so you can explain the finding and the referral to her directly.",
    "A professional interpreter is the only reliable way to make sure she understands and can consent."
   ],
   [
    "Let her son interpret the basics today, and use a professional interpreter for detail at a later visit.",
    "Pragmatic, but even the basics of possible serious news shouldn’t be passed through a child."
   ],
   [
    "Ask a bilingual receptionist to interpret, as she speaks the patient’s language and is free now.",
    "Quick, but untrained colleagues risk inaccuracy and she may not want staff to know her health details."
   ],
   [
    "Explain the finding in simple English with diagrams, checking her understanding as you go.",
    "A reasonable effort, but you can’t be sure she understands enough to make an informed decision."
   ],
   [
    "Don’t let arranging an interpreter hold up the urgent referral being sent today.",
    "Keeps the clinical timeline on track while communication is sorted out."
   ],
   [
    "Give her written information about the referral in her first language, if the practice has it.",
    "Supports what the interpreter tells her and gives her something to refer back to."
   ],
   [
    "Ask her to bring an adult relative or friend to interpret at a follow-up appointment this week.",
    "Better than a child, but family interpreters are less reliable than professionals and it adds delay."
   ],
   [
    "Write to her GP asking them to explain the referral to her using their interpreting service.",
    "Gets it explained eventually, but hands over a conversation that is your responsibility."
   ]
  ],
  "tk": "For important news across a language barrier, use a professional interpreter and never let arranging one delay urgent care; adult relatives and bilingual staff are tempting but second best."
 },
 {
  "t": "rank",
  "d": "P",
  "a": "Unsafe working conditions",
  "k": "ADECB",
  "s": "You’re about to start a 45-minute root canal treatment when your nurse says she feels faint and needs to sit down. No other nurse is free for the next hour.",
  "o": [
   [
    "Sit your nurse down, check she’s alright and get her help, then explain the delay to your patient and rebook.",
    "Puts your colleague’s welfare first and avoids treating without a trained assistant."
   ],
   [
    "Start the root canal single-handed, as you’re trained to, and ask a nurse to join you when one is free.",
    "Keeps the appointment, but working alone through a complex procedure isn’t justified when nothing is exceptional."
   ],
   [
    "Ask the receptionist to sit in as chairside support, so that you have a second person in the room.",
    "A second person helps with chaperoning, but someone without nurse training can’t safely assist this procedure."
   ],
   [
    "Once your nurse is settled, ask the manager if another nurse can be freed and let the patient choose to wait.",
    "A sensible attempt to save the appointment, just behind making sure your nurse is safe."
   ],
   [
    "Postpone the root canal, but carry out a routine check-up on your own so the visit isn’t wasted.",
    "Lower risk, but still working without a second person when there’s no need to."
   ]
  ],
  "tk": "When your nurse becomes unwell, look after her first and don’t treat without the team you need; saving the appointment only matters once both are safe."
 }
];

const RW_2_3 = [
 {
  "t": "best3",
  "d": "I",
  "a": "An error with a second patient",
  "k": "ACD",
  "s": "Mid-afternoon you realise that this morning you based Mrs Shah’s treatment plan on another patient’s radiographs, which had been saved to her record by mistake. The plan includes an extraction booked for next week. She has already left with a printed copy.",
  "o": [
   [
    "Phone Mrs Shah today, explain that the plan used the wrong radiographs, apologise and arrange a review.",
    "Candour comes first: she holds a plan based on someone else’s images, and any delay risks her acting on it."
   ],
   [
    "Tell your ES what has happened and agree with them how best to approach Mrs Shah.",
    "Sensible support, but this is your error to disclose and telling her shouldn’t wait for a joint plan."
   ],
   [
    "Check whether the other patient’s record and treatment plan have also been affected.",
    "The other patient may have been planned without their own images, so they could also be at risk."
   ],
   [
    "Report the misfiling through the practice’s incident reporting system.",
    "Brings the system fault into the open so the filing process can be investigated and fixed."
   ],
   [
    "Cancel next week’s extraction now, and explain the error when she comes in for a review.",
    "Removes the immediate clinical risk, but delays telling her what went wrong while she holds the printed plan."
   ],
   [
    "Call your defence organisation for advice before you speak to Mrs Shah about it.",
    "Advice may help later, but nothing here needs it before candour, and waiting delays telling her."
   ],
   [
    "Move the radiographs to the correct patient’s record straight away so no one uses them by mistake.",
    "Well-meant, but corrections should be made with an audit trail as part of the incident review."
   ],
   [
    "Speak privately to the nurse who filed the radiographs and ask her to check today’s other filing.",
    "Fixes one person’s filing rather than the process, and can feel like blame before the facts are known."
   ]
  ],
  "tk": "Error items: tell the patient promptly yourself, think about who else is affected, and fix the system rather than quietly tidying the record."
 },
 {
  "t": "rank",
  "d": "E",
  "a": "Autonomy versus clinical judgement",
  "k": "CAEDB",
  "s": "Mr Doyle, 60, has several heavily filled but restorable teeth. Fed up with repeated treatment, he asks you to take them all out and give him dentures. He clearly understands the consequences and has been thinking about it for months.",
  "o": [
   [
    "Propose a plan that cuts future treatment, such as removing only the teeth with the poorest outlook.",
    "Meets his real goal of less treatment while keeping restorable teeth, and builds on first exploring his reasons."
   ],
   [
    "Agree to the clearance as he has capacity, but stage the extractions so he can change his mind.",
    "Staging feels cautious, but capacity lets him refuse care; it doesn’t oblige you to remove restorable teeth against your judgement."
   ],
   [
    "Explore why he wants them out and explain all his options, including the long-term drawbacks of dentures.",
    "Understanding his reasons and giving him the full picture is the basis of any informed choice, so it comes first."
   ],
   [
    "Tell him a clearance needs your ES’s agreement, and book him in to discuss it with them.",
    "Your ES can support you, but this discussion is within your competence and handing it over delays his decision."
   ],
   [
    "If he still wants a clearance you don’t think is in his interests, offer a referral for a second opinion.",
    "Respects his autonomy without you acting against your judgement, but is a fallback once a tailored plan has been discussed."
   ]
  ],
  "tk": "Autonomy items: a capable patient can refuse treatment but can’t require it; explore, tailor a plan, then offer a second opinion rather than complying in stages."
 },
 {
  "t": "consider",
  "d": "I",
  "a": "Disclosure to the police",
  "k": "CEADB",
  "s": "A police officer at reception asks for a patient’s records. They say they’re investigating a burglary and need to confirm whether the patient attended one afternoon. They have no court order, and the patient doesn’t know.",
  "o": [
   [
    "Whether the burglary is serious enough to justify disclosure in the public interest.",
    "Public interest can justify disclosure without consent, but only for serious crime, and a burglary may not reach that bar."
   ],
   [
    "What the practice’s policy says about police requests, and who normally handles them.",
    "Useful for handling the request properly, but a policy supports the decision rather than making it."
   ],
   [
    "Whether the patient has consented, or could be asked, to the information being shared.",
    "Consent is the first basis for any disclosure, and here the patient can simply be asked."
   ],
   [
    "What is the minimum information that would answer the officer’s question.",
    "Important if disclosure goes ahead, but it follows from first deciding whether disclosure is justified at all."
   ],
   [
    "Whether a court order or a specific legal duty requires the practice to disclose.",
    "Without consent, a legal requirement is the next basis, and its absence here matters."
   ]
  ],
  "tk": "Disclosure items: consent, then the law, then a serious public interest; sharing the minimum and following process come after the decision to share."
 },
 {
  "t": "best3",
  "d": "T",
  "a": "Repeated unsafe practice",
  "k": "ACE",
  "s": "Two weeks ago you privately mentioned to an associate that you’d seen him re-using single-use items, and he thanked you. Today you see him doing it again.",
  "o": [
   [
    "Raise it today with the practice’s infection control lead or the practice owner.",
    "A private word has been tried and hasn’t worked, so the next rung is the relevant lead within the practice."
   ],
   [
    "Speak to him again, more firmly this time, and say you’ll escalate if it happens again.",
    "Reasonable once, but repeating it leaves patients at risk while he decides whether to change."
   ],
   [
    "Make a dated, factual note of what you saw and when you saw it.",
    "An accurate, contemporaneous record supports a fair investigation."
   ],
   [
    "Report your concern to the GDC, as re-using single-use items puts patients at risk.",
    "The concern is serious, but the practice route hasn’t been tried and can act faster."
   ],
   [
    "Give the lead details of the patients treated, so any risk to them can be assessed.",
    "Safety includes patients who may already have been exposed, and the lead can decide how to follow them up."
   ],
   [
    "Ask his nurse to make sure only new single-use items are set out for his sessions.",
    "Protects his next patients, but it is a workaround that leaves his practice unaddressed and the nurse in an awkward role."
   ],
   [
    "Suggest a practice-wide infection control refresher at the next team meeting.",
    "Useful for the team, but a general refresher doesn’t deal with one clinician’s repeated behaviour."
   ],
   [
    "Contact the patients he treated today yourself to explain they may have been exposed.",
    "Well-meant, but contacting patients should follow an assessment by the practice, not your judgement alone."
   ]
  ],
  "tk": "Second-occurrence items: when a quiet word hasn’t worked, go up one rung within the practice, record the facts and think about patients already exposed."
 },
 {
  "t": "rank",
  "d": "P",
  "a": "Pressure built into the system",
  "k": "BDEAC",
  "s": "The practice manager insists that all new-patient NHS examinations are booked into 20-minute slots to meet demand. At your stage, that isn’t long enough for a thorough examination, radiographs and treatment planning. You’re regularly 30 minutes behind by lunch.",
  "o": [
   [
    "Work through your lunch break so patients get a full examination while the issue is sorted.",
    "Protects patients for now, but it hides the problem, isn’t sustainable and still leaves patients waiting."
   ],
   [
    "Show the practice manager examples of where 20 minutes fell short, and propose longer slots for now.",
    "Direct, evidence-based and constructive, giving the manager who set the policy a practical solution to consider first."
   ],
   [
    "Complete the examination in the slot and take routine radiographs at the patient’s next visit.",
    "Sounds pragmatic, but delaying indicated radiographs lets the timetable dictate clinical care."
   ],
   [
    "Ask your ES to help you agree appointment lengths that suit your stage of training.",
    "Your ES oversees your training environment and has the authority to change it, making this a close alternative to raising it directly."
   ],
   [
    "Raise the appointment lengths with your TPD, as they affect the quality of your training.",
    "A legitimate route for a training concern that can bring a lasting fix, though it skips the manager and your ES, who could resolve it sooner."
   ]
  ],
  "tk": "System-pressure items: raise it constructively yourself, then with your ES; giving up your own time is middling, and letting the timetable shape care is worst."
 },
 {
  "t": "best3",
  "d": "E",
  "a": "Criticism online",
  "k": "ABD",
  "s": "A patient has posted a one-star online review naming you. It says you were ‘rough and rude’ during an extraction and ‘botched’ it. The details make it clear who the patient is. You believe the review is unfair.",
  "o": [
   [
    "Contact your defence organisation for advice before anyone responds to the review.",
    "An allegation of a ‘botched’ extraction could become a claim, and early advice helps avoid a response that breaches confidentiality or prejudices it."
   ],
   [
    "Think back over the appointment and whether anything could have come across as rough.",
    "Shows insight; even an unfair review may contain something to learn from."
   ],
   [
    "Post a brief public reply inviting the reviewer to contact the practice, without giving details.",
    "Taking it offline is right, but a public reply from you risks confirming the patient relationship and is best left to the practice after advice."
   ],
   [
    "Tell the practice manager so the practice can manage it through its complaints process.",
    "Uses the proper channel, so the patient is contacted privately and the response is handled consistently."
   ],
   [
    "Ask the review site to take the review down, as it is unfair and identifies the patient.",
    "Understandable, but it treats the review as something to remove rather than a complaint to resolve."
   ],
   [
    "Arrange for the practice to contact the patient privately and offer to discuss their concerns.",
    "Sound, but the practice’s complaints process in H would make this private contact anyway."
   ],
   [
    "Save a copy of the review alongside your clinical notes in case it becomes a formal complaint.",
    "Sensible housekeeping, but it doesn’t address the patient’s concerns or your own practice."
   ],
   [
    "Offer, through the practice, to refund the patient’s charges as a goodwill gesture.",
    "Offering a remedy before hearing the concern is premature and may be read as an admission."
   ]
  ],
  "tk": "Online-criticism items: take it offline through the practice, treat it as a complaint and reflect; personal public replies and removal requests come second."
 },
 {
  "t": "rank",
  "d": "T",
  "a": "Peer dishonesty",
  "k": "DBEAC",
  "s": "During an online course assessment that counts towards your DFT requirements, a fellow FD posts photos of the answers in your study group chat. They got them from a previous year’s trainee.",
  "o": [
   [
    "Raise it with your ES at your next tutorial and ask how they would like you to handle it.",
    "Your ES could advise, but waiting for a tutorial delays action while the assessment is still open."
   ],
   [
    "Without opening them, message the FD privately to say you’re uncomfortable and ask them to delete them.",
    "Protects your own integrity and gives your colleague a chance to put it right, but the answers are already with the whole group."
   ],
   [
    "Open the photos first to check what has actually been shared before deciding what to do.",
    "Seems like fact-finding, but viewing the answers compromises your own assessment and your integrity."
   ],
   [
    "Tell the course organiser the answers are circulating so the assessment’s fairness can be protected.",
    "The only option that protects the fairness of an assessment that is still open, and it does so without naming anyone."
   ],
   [
    "Post in the group that you won’t be using the answers and suggest everyone does it on their own.",
    "Makes your own position clear, but in public, and it leaves the organiser unaware the assessment is compromised."
   ]
  ],
  "tk": "Peer-dishonesty items: keep your own hands clean, speak privately first, then make sure the organiser knows; checking the material yourself is the trap."
 },
 {
  "t": "best3",
  "d": "P",
  "a": "A safety requirement is missing",
  "k": "ADG",
  "s": "A patient arrives for IV sedation with your ES. He has come alone and says his escort ‘couldn’t make it’, but he’ll get a taxi home. Your ES is running 20 minutes late and has asked you to prepare the patient.",
  "o": [
   [
    "Let your ES know about the missing escort before any preparation for sedation begins.",
    "Your ES is responsible for the sedation and needs to know before anything is set in motion."
   ],
   [
    "Take his baseline observations while you wait, so no time is lost when your ES arrives.",
    "Harmless in itself, but it builds momentum towards sedation before the escort problem is resolved."
   ],
   [
    "Suggest a friend meets him off the taxi and checks on him by phone that evening.",
    "Well-meant, but an escort needs to stay with him afterwards, and a phone call doesn’t meet the requirement."
   ],
   [
    "Explain to him that sedation can’t go ahead without a responsible adult escort, and why.",
    "Honest and clear about a safety requirement, so he understands the decision isn’t arbitrary."
   ],
   [
    "Record in his notes that he has arrived without an escort and plans to take a taxi home.",
    "Worth doing, but recording the problem comes after dealing with it."
   ],
   [
    "Ask whether a nurse could travel home with him in the taxi after the appointment.",
    "An improvised fix that puts a colleague in an inappropriate role and still leaves him alone overnight."
   ],
   [
    "Offer to rebook the sedation, or discuss whether local anaesthetic alone would suit today.",
    "Gives him practical ways forward so he isn’t simply turned away."
   ],
   [
    "Go through his pre-sedation instructions with him to check the escort rule was explained.",
    "Useful feedback for the practice later, but it doesn’t resolve today’s decision."
   ]
  ],
  "tk": "Safety-requirement items: tell the responsible senior, explain the rule honestly and offer alternatives; improvised escorts and early preparation don’t close the gap."
 }
];

const RW_2_4 = [
 {
  "t": "rank",
  "d": "T",
  "a": "Honest references",
  "k": "BDEAC",
  "s": "A dental nurse who is leaving for another practice asks you to be her referee. The new employer’s form asks specifically about her clinical standards. You’ve found her reliable and kind to patients, but she has repeatedly failed to follow infection control procedures despite reminders.",
  "o": [
   [
    "Agree to provide a reference that confirms only her role and dates of employment, as practice policy allows.",
    "Accurate, but it leaves the employer’s question on clinical standards unanswered when you know of a safety concern."
   ],
   [
    "Tell her privately that your reference would need to mention infection control, and let her decide whether to use you.",
    "Open and fair: she hears it from you first, and any reference you then give stays honest."
   ],
   [
    "Write a reference focused on her strengths, adding that you’d be happy to discuss her clinical practice by phone.",
    "Well meant, but a positive written reference reads as an endorsement and leaves the safety concern to a call that may never happen."
   ],
   [
    "Write a balanced, factual reference covering both her strengths and the infection control concerns, and send it.",
    "Honest and complete, but she should hear about the concerns from you before the new employer reads them."
   ],
   [
    "Suggest she asks the practice manager for a reference instead, as the manager oversees staff conduct and training.",
    "Reasonable, but it passes on a judgement you are well placed to make, and the concern may still not be shared."
   ]
  ],
  "tk": "References must be honest and complete on safety matters, and the person should hear any concerns from you before the employer reads them."
 },
 {
  "t": "best3",
  "d": "T",
  "a": "Bullying by your supervisor",
  "k": "BDG",
  "s": "Your ES, who owns the practice, often speaks sharply to the newest nurse, sometimes while patients are present. Today you find her crying in the staff room. She says she doesn’t want to cause trouble.",
  "o": [
   [
    "Encourage her to raise it with the ES herself first, and offer to go with her when she does.",
    "Supportive, but it puts the burden on someone who has said she doesn’t want trouble, when you have witnessed it yourself."
   ],
   [
    "Listen to her, and make sure she knows the practice’s dignity at work policy and who she can speak to.",
    "Supports her now and leaves the choice of formal steps with her."
   ],
   [
    "Keep a dated note of the incidents you witness, so there is an accurate record if it’s needed later.",
    "Useful, but a record on its own doesn’t support her or change the behaviour."
   ],
   [
    "Raise what you’ve seen with your ES privately, describing specific incidents and the effect they had.",
    "The direct first step, even though it is your supervisor, and it doesn’t rely on her complaining."
   ],
   [
    "Mention it to the practice manager so they can keep an eye on how the nurse is being treated.",
    "A normal route in many practices, but here the manager reports to the owner, so it is unlikely to resolve it."
   ],
   [
    "Ask whether she’d like you to arrange for her to work with another dentist for the time being.",
    "Kind, but it moves her away from the problem instead of addressing the behaviour."
   ],
   [
    "Seek advice from your TPD if you don’t feel able to raise it with your ES, or if it continues.",
    "The right route when your supervisor is the source of the problem."
   ],
   [
    "Offer to check in with her regularly, and let her decide when she’s ready to take it further.",
    "Respects her wishes, but as a witness you have your own responsibility to act on what you’ve seen."
   ]
  ],
  "tk": "When your supervisor is the problem: support the colleague, raise it with the ES directly, and use the TPD as the next rung, not a manager who answers to the ES."
 },
 {
  "t": "rank",
  "d": "E",
  "a": "Lasting power of attorney",
  "k": "BEDCA",
  "s": "Mrs Carter, 86, has advanced dementia and lacks capacity to make decisions about her dental care. She has a painful abscessed lower molar. Her son holds a health and welfare lasting power of attorney (LPA) and declines the extraction because he doesn’t want her ‘put through it’.",
  "o": [
   [
    "Accept his decision as her attorney, and record it clearly in her notes together with his reasons.",
    "Respects his legal authority, but leaves her in pain without making sure his decision is informed."
   ],
   [
    "Explain the likely consequences of leaving the abscess, and explore his concerns and what she would have wanted.",
    "Makes sure the attorney’s decision is informed and centred on her own wishes and values."
   ],
   [
    "Prescribe antibiotics and painkillers for now, and review her in a week to see whether he has reconsidered.",
    "Offers short-term help, but antibiotics alone won’t resolve the abscess, and it postpones the real discussion."
   ],
   [
    "If you still think his decision isn’t in her best interests, seek advice from your ES or defence organisation.",
    "The right step when an attorney’s decision seems to go against her interests, but after informing him and exploring options."
   ],
   [
    "Discuss alternatives that might address his worries, such as referral to a special care dental service.",
    "Looks for a way of treating her that he may accept, once his concerns are understood."
   ]
  ],
  "tk": "LPA items: inform the attorney and explore their concerns, look for acceptable alternatives, then seek advice. Temporising or simply accepting leaves the patient untreated."
 },
 {
  "t": "best3",
  "d": "I",
  "a": "Prescribing outside your scope",
  "k": "BDF",
  "s": "The practice hygienist, a friend of yours, asks you to write her a private prescription for antibiotics for a chest infection, as she can’t get a GP appointment for three days. She has a full list this afternoon.",
  "o": [
   [
    "Check with your ES whether there are any circumstances in which you could help her with this.",
    "Deferring on something you already know: prescribing for a chest infection is outside a dentist’s scope."
   ],
   [
    "Explain kindly that you can only prescribe for dental conditions, so this isn’t something you can do.",
    "Clear and honest about your scope, without damaging the friendship."
   ],
   [
    "Offer to see some of her patients this afternoon so that she can go home and rest.",
    "Generous, but it doesn’t get her the medical assessment she needs."
   ],
   [
    "Suggest she contacts a community pharmacist or NHS 111 today about being assessed sooner.",
    "Points her to appropriate care now, rather than in three days."
   ],
   [
    "Recommend over-the-counter remedies and rest until her GP appointment in three days’ time.",
    "Practical, but it is still medical advice outside your scope and may delay proper assessment."
   ],
   [
    "Ask how unwell she feels, and advise urgent medical help if she becomes breathless or worse.",
    "Keeps her safe by making sure she knows when to seek help straight away."
   ],
   [
    "Tell the practice manager she is unwell so they can decide whether she should be working today.",
    "Understandable, but her health is hers to share, and she may choose to tell the manager herself."
   ],
   [
    "Say you’ll check the GDC and BNF guidance on prescribing for colleagues before giving her an answer.",
    "Cautious, but you already know the answer, and waiting delays her getting the right help."
   ]
  ],
  "tk": "When a friend asks for treatment outside your scope: say no kindly, point her to the right service today, and make sure she knows when it’s urgent."
 },
 {
  "t": "rank",
  "d": "T",
  "a": "Clinical advice from the wrong person",
  "k": "CEDBA",
  "s": "You overhear a new receptionist telling a patient on the phone that swelling after their extraction ‘is normal, just take ibuprofen’, without checking with a clinician. You did the extraction yesterday and have a gap before your next patient.",
  "o": [
   [
    "Mention it at the next practice meeting as a general reminder to all staff, without naming anyone.",
    "Tactful, but it does nothing for this patient and the reminder may come too late."
   ],
   [
    "Suggest to the practice manager that reception staff get a written protocol for clinical queries.",
    "A sensible fix for the whole practice, but after the patient and the one-to-one conversation."
   ],
   [
    "Get the patient’s details and phone them yourself now to assess the swelling and advise them.",
    "The patient hasn’t been assessed by a clinician, and you are their dentist and free to do it."
   ],
   [
    "Speak to the receptionist privately afterwards about why clinical questions go to a clinician.",
    "Addresses the behaviour supportively, but the patient’s safety comes first."
   ],
   [
    "Ask the receptionist to ring the patient back and offer them a review appointment today.",
    "Gets the patient seen, but a clinician could assess them sooner and more directly by phone."
   ]
  ],
  "tk": "When a non-clinician gives clinical advice: make sure a clinician assesses the patient, then have a private word, then fix the system."
 },
 {
  "t": "consider",
  "d": "P",
  "a": "Borderline go or no-go decision",
  "k": "DBEAC",
  "s": "It’s your last appointment of a long day. A patient with a lower molar that needs extracting has arrived 25 minutes late. They’ve taken the afternoon off work and are anxious to have it done today. You’re tired, and your nurse needs to leave on time to collect her children.",
  "o": [
   [
    "The practice’s late-arrivals policy, and how it has been used for other patients.",
    "Relevant for fairness and consistency, but secondary to safety and the patient’s needs."
   ],
   [
    "Whether a trained nurse can stay for the whole procedure, including any complications.",
    "Working with a trained assistant is a safety requirement, just behind your own fitness to operate."
   ],
   [
    "How late you would finish, and the effect on your own plans for the evening.",
    "A legitimate consideration, but the least important of these."
   ],
   [
    "Whether you can carry out the extraction safely in the time left, given how tired you are.",
    "Your fitness to operate is the most direct factor in the patient’s safety."
   ],
   [
    "The patient’s pain, and how soon you could offer them another suitable appointment.",
    "Important, and it shapes what you offer, but it can’t override the safety factors."
   ]
  ],
  "tk": "Borderline go or no-go decisions: your own fitness and safe support come first, then the patient’s needs, then policy, then your own plans."
 },
 {
  "t": "best3",
  "d": "E",
  "a": "Health anxiety and irreversible treatment",
  "k": "BDG",
  "s": "A patient with eight sound amalgam fillings asks you to replace them all with white fillings. She has read that they’re ‘poisoning’ her and causing her fatigue, and she is very worried.",
  "o": [
   [
    "Offer to replace one filling first, to see whether her symptoms improve before doing the rest.",
    "A compromise, but it still removes sound tooth tissue and may reinforce her worry."
   ],
   [
    "Acknowledge her worry, and ask what she has read and what symptoms she has been noticing.",
    "Explores her concerns before you give information."
   ],
   [
    "Give her a leaflet on amalgam safety and book a follow-up to discuss it once she’s read it.",
    "Helpful, but written material alone is less effective than discussing it with her now."
   ],
   [
    "Suggest she sees her GP about the fatigue, as it may have another cause worth investigating.",
    "Takes her symptoms seriously and points her to the right professional."
   ],
   [
    "Agree to replace each filling with a white one when it next needs repair or replacement.",
    "Reasonable in the long run, but it doesn’t address her worry or the cause of her fatigue."
   ],
   [
    "Suggest she gets a second opinion from another dentist before making any decision.",
    "She is free to do this, but it passes on a conversation you are able to have."
   ],
   [
    "Explain the current evidence on amalgam safety in a balanced and non-dismissive way.",
    "Supports an informed choice based on the evidence."
   ],
   [
    "Ask your ES to see her, as a more senior view may reassure her more effectively.",
    "Defers something within your competence, and may suggest there is more to worry about."
   ]
  ],
  "tk": "Health-anxiety items: explore, inform with evidence, and look for the real cause. Compromises that still remove sound tissue are the trap."
 },
 {
  "t": "rank",
  "d": "I",
  "a": "Serious error in the moment",
  "k": "BDECA",
  "s": "While treating a child, you realise you have given more local anaesthetic than the maximum recommended dose for their weight. The child seems well at the moment, the treatment is almost finished, and the parent is in the room.",
  "o": [
   [
    "Contact your defence organisation for advice before you speak to the parent about what happened.",
    "Deliberately delays telling a parent who is in the room and does nothing to keep the child safe, when advice must never delay candour."
   ],
   [
    "Stop giving anaesthetic, monitor the child closely for toxicity, and call a senior colleague now.",
    "Immediate patient safety, with senior help while the risk is greatest."
   ],
   [
    "Finish the treatment quickly using the anaesthetic already given, watching closely for any reaction.",
    "Poor, as it brings in no senior help and tells the parent nothing, but no more anaesthetic is given and the child stays under close watch."
   ],
   [
    "Tell the parent what has happened, apologise, and explain what you’re doing to keep their child safe.",
    "Prompt candour, just behind the immediate safety steps."
   ],
   [
    "Record the doses and events accurately in the notes, and complete an incident report.",
    "Essential, but it comes after making the child safe and telling the parent."
   ]
  ],
  "tk": "Serious-error items: stop and make the patient safe, then tell the family, then record. Advice from your defence organisation must not delay candour."
 }
];

const RW_3_1 = [
 {
  "t": "consider",
  "d": "I",
  "g": "C",
  "a": "Missed lesion found at review",
  "k": "DBEAC",
  "s": "At a check-up you compare today’s bitewings with ones you took eight months ago. You realise that a lesion on the patient’s lower left first molar was visible on the previous radiograph, but you did not record or treat it, and it now looks close to the pulp. She has no symptoms and does not know. Rank these considerations in order of importance.",
  "o": [
   [
    "How far the lesion was realistically detectable on the previous radiograph, rather than obvious only in hindsight.",
    "How detectable the lesion was will shape your reflection. She is owed the explanation either way, though, and dwelling on it risks a self-justifying framing, so it ranks below learning from the miss."
   ],
   [
    "Her right to a clear and honest account that the lesion was visible before and was not acted on.",
    "Candour is owed as soon as you recognise the miss, and she needs the explanation to consent to the treatment now needed. It is a very close second to protecting the tooth itself."
   ],
   [
    "How the treatment now needed will be funded, and whether the practice should offer it at no charge.",
    "Whether to waive the fee may be fair to raise. Funding is still a practice-level question that comes after honesty, treatment and learning have been addressed."
   ],
   [
    "The need to treat the tooth promptly to reduce the risk of pain, infection or losing the tooth.",
    "The immediate clinical need: the lesion is near the pulp, so prompt treatment protects the tooth. She can be told and treated at the same visit, so candour follows closely rather than competing."
   ],
   [
    "Reviewing your radiograph reporting with your ES so the same miss is not repeated with other patients.",
    "Reviewing your radiograph reporting with your ES protects future patients. It ranks below this patient’s right to know and her tooth’s immediate needs, but above questions of hindsight and cost."
   ]
  ],
  "tk": "When you find your own missed lesion, the tooth comes first and candour a close second; learning, hindsight and cost follow."
 },
 {
  "t": "rank",
  "d": "E",
  "g": "C",
  "a": "Numb lip after extraction",
  "k": "CBEAD",
  "s": "Three days after you surgically removed her lower left third molar, a patient phones. Her lower lip and chin on that side are still numb, and she asks you directly whether you have damaged a nerve. You warned her of this risk when she consented, and you are not yet sure whether the change is temporary.",
  "o": [
   [
    "Explain that nerve changes were among the risks you discussed at consent, and suggest she ring back in two weeks if it persists.",
    "Referring back to consent is accurate but feels defensive, and a two-week wait delays an assessment she may need sooner."
   ],
   [
    "Discuss the case with your ES the same day, including whether she needs an early referral to oral surgery.",
    "A possible nerve injury is beyond routine FD management, and senior advice on early referral may affect recovery."
   ],
   [
    "Tell her honestly that the nerve may have been affected, that many cases recover, and offer to see her within a few days.",
    "It answers her direct question without overstating certainty, and a review within days allows early assessment."
   ],
   [
    "Reassure her that numbness like this always settles by itself, and book a review appointment for six weeks’ time.",
    "It sounds kind, but ‘always settles’ promises more than you know, and a six-week review is the longest delay offered."
   ],
   [
    "Explain that you need to examine her before you can say more, and book her into your next routine slot next week.",
    "Examining her is right, but it sidesteps her question and next week is slower than a prompt review would be."
   ]
  ],
  "tk": "Uncertain complications: answer the patient’s question honestly and see them promptly; the consent discussion or kind reassurance does not replace early review."
 },
 {
  "t": "best3",
  "d": "P",
  "g": "C",
  "a": "Wrong analgesic advice given",
  "k": "ADG",
  "s": "Twenty minutes after a patient leaves following an extraction, your nurse points out that you told him to take ibuprofen for pain. His medical history, which you only skimmed, records asthma that NSAIDs make worse. Your next patient is already in the chair and you are running ten minutes late.",
  "o": [
   [
    "Step out briefly and phone him now, apologise, explain that your advice was wrong and tell him what to take instead.",
    "He could take a dose at any moment, so a brief pause to correct the advice yourself is safe, honest and proportionate."
   ],
   [
    "Ask the receptionist to phone him now and pass on that he should avoid ibuprofen and use paracetamol instead.",
    "It is quick, but the error is yours to explain, and a receptionist cannot answer his clinical questions."
   ],
   [
    "Treat your current patient first, then phone him yourself before you call in the next one on your list.",
    "It feels fair to the patient in the chair, but the delay risks him taking ibuprofen before you reach him."
   ],
   [
    "Add a dated entry to his record describing the error, the corrected advice and his response to your call.",
    "A contemporaneous addendum records what happened without altering the original entry."
   ],
   [
    "Send him a text through the practice system straight away advising him to avoid ibuprofen and use paracetamol.",
    "It is fast, but he may not read it in time and it gives him no explanation or apology."
   ],
   [
    "Call your defence organisation for advice on how to word the conversation before you contact him.",
    "Advice can be sought afterwards; nothing should delay a call that prevents harm."
   ],
   [
    "Report it through the practice incident system and discuss with your ES how the history came to be missed.",
    "Reporting and reflecting with your ES addresses the cause, so histories are read fully before advice is given."
   ],
   [
    "Check his record for how his asthma is managed and which inhalers he uses, so your call gives complete advice.",
    "Accurate advice matters, but the ibuprofen warning is simple and should not wait for a fuller review."
   ]
  ],
  "tk": "Own errors with ongoing risk: correct them yourself straight away, then record an addendum and report for learning; speed matters more than polish."
 },
 {
  "t": "rank",
  "d": "P",
  "g": "C",
  "a": "Dropped file, possibly inhaled",
  "k": "CBDAE",
  "s": "A patient who cannot tolerate rubber dam is having root canal treatment on an upper molar with cotton-roll isolation. A small hand file slips from your fingers towards the back of his mouth; he coughs, then says he feels fine. You cannot find the file in his mouth, on the bib or in the suction, and he is keen to carry on so he can get back to work.",
  "o": [
   [
    "Record the incident fully in his notes and complete a report through the practice incident system.",
    "Records and an incident report are required, but they come after his safety has been secured."
   ],
   [
    "Tell your ES straight away so they can help you assess him and organise the next steps with you.",
    "Your ES should know at once and can support the referral; this backs up the urgent plan rather than replacing it."
   ],
   [
    "Stop, explain that the file may have been inhaled or swallowed, apologise, and arrange an urgent chest radiograph at A&amp;E.",
    "The file is unaccounted for and may be in his airway, so telling him and arranging urgent imaging protects him best."
   ],
   [
    "Stop, explain that the file may have been inhaled, and ask him to see his GP today to arrange a chest radiograph.",
    "Candid and arranges imaging today, but relying on a GP appointment is slower and less certain than a direct urgent referral."
   ],
   [
    "Stop, sit him upright and check for wheeze or breathlessness for a few minutes, then refer if anything develops.",
    "Checking for symptoms seems careful, but an inhaled file may cause no early signs, so a clear chest does not rule it out."
   ]
  ],
  "tk": "Missing instrument: a symptom-free patient still needs urgent imaging; involve your supervisor, then document."
 },
 {
  "t": "best3",
  "d": "E",
  "g": "S",
  "a": "Carer using patient’s bank card",
  "k": "ACD",
  "s": "An 84-year-old widower with mild dementia attends with his paid carer. The carer asks you to quote for private veneers for him and says she will pay with his bank card ‘as she always does’. When she steps out, he seems unsure about the cost and says he only wants his denture to stop rubbing.",
  "o": [
   [
    "Focus on his own concerns about the denture, explain the options simply and assess his capacity to decide on cost.",
    "It centres his own wishes and tests capacity for this specific decision rather than assuming it either way."
   ],
   [
    "Hold off giving any veneer quote until a family member has confirmed that they are happy with the plan.",
    "It is protective, but it is paternalistic, may breach his confidentiality and does not address the concern itself."
   ],
   [
    "Discuss your concern about possible financial abuse with the practice safeguarding lead the same day.",
    "His card being used for treatment he has not asked for is a warning sign, and the lead can guide whether to refer."
   ],
   [
    "Record accurately in his notes what he and the carer each said, and the specific points that concern you.",
    "Factual notes of what each person said support any safeguarding decision made later."
   ],
   [
    "Ask the carer, when she returns, to explain how his money is usually managed and who authorises spending.",
    "It feels like fact-finding, but investigating is not your role and it may alert her to your concern."
   ],
   [
    "Give the veneer quote alongside the denture options, so he can make an informed choice with all the facts.",
    "It respects his choice in theory, but he has asked only about his denture and the warning signs need action."
   ],
   [
    "Contact his next of kin from the details on his record to let them know about your concerns.",
    "Family may help, but sharing concerns without his consent or the lead’s advice risks his confidentiality."
   ],
   [
    "Make a referral to the local adult social care team yourself today, reporting a concern about financial abuse.",
    "A referral may follow, but there is no immediate danger, so the practice lead should be involved first."
   ]
  ],
  "tk": "Suspected financial abuse: centre the patient’s own wishes and capacity, record the facts and go through the safeguarding lead before any outside referral."
 },
 {
  "t": "rank",
  "d": "E",
  "g": "S",
  "a": "Teenager discloses self-harm",
  "k": "BDACE",
  "s": "While giving local anaesthetic to a 16-year-old, you notice several healing cuts on her forearm. When you ask gently, she says she has been cutting herself for a few months and feels ‘fine now’, and she begs you not to tell her mother, who is in the waiting room. She says she has no thoughts of ending her life.",
  "o": [
   [
    "Give her details of support services, such as a young people’s helpline, and offer to contact her GP with her agreement.",
    "Signposting and involving her GP with consent are helpful, but they support rather than replace the safeguarding route."
   ],
   [
    "Thank her for telling you, and explain calmly that you cannot promise secrecy but will talk with her about who needs to know.",
    "It keeps her trust while being honest about the limits of confidentiality, and it is what the moment requires."
   ],
   [
    "Encourage her to tell her mother herself before she leaves today, and offer to be with her while she does.",
    "A parent can help, but pressing this against her stated wishes risks her trust, and home may be part of the problem."
   ],
   [
    "Discuss your concerns with the practice safeguarding lead today and follow the practice’s safeguarding procedure.",
    "Self-harm at 16 is a safeguarding concern, and the lead can help decide what should be shared and with whom."
   ],
   [
    "Ask her more about when the cutting started and what is happening at home, so you can judge the level of risk.",
    "It feels caring, but detailed questioning is investigation beyond your role and may make her withdraw."
   ]
  ],
  "tk": "A young person’s disclosure: be honest about confidentiality, keep them engaged and use the safeguarding lead; don’t investigate or push family involvement."
 },
 {
  "t": "rank",
  "d": "P",
  "g": "S",
  "a": "Intoxicated parent about to drive",
  "k": "BEACD",
  "s": "A mother brings her 6-year-old son for a 9am check-up. She smells strongly of alcohol, is slurring slightly and unsteady on her feet, and mentions that she will drive him to school afterwards. Your nurse has noticed the same.",
  "o": [
   [
    "Discuss the situation with the practice safeguarding lead and refer to children’s social care in line with local procedures.",
    "A referral is right given what you have seen, but it does not stop her driving him this morning."
   ],
   [
    "Tell her sensitively that you are worried, ask her not to drive, and offer to help arrange another way to get to school.",
    "Speaking to her directly and offering a safe alternative deals with the immediate risk while treating her with respect."
   ],
   [
    "Record your observations of her, and what she said about driving, factually in the child’s notes.",
    "Factual notes support any referral, but they do nothing for his safety in the next hour."
   ],
   [
    "Suggest she waits in the practice with a drink of water until she feels steadier before she sets off.",
    "It is kindly meant, but feeling steadier does not mean she is safe to drive, so the risk to the child remains."
   ],
   [
    "Involve your ES straight away, and agree that the police are contacted if she still plans to drive him.",
    "Senior support and a clear plan for police involvement address the risk if your first approach does not work."
   ]
  ],
  "tk": "Immediate risk to a child: act directly to stop the danger now and plan for police involvement; referral and records follow."
 },
 {
  "t": "best3",
  "d": "E",
  "g": "S",
  "a": "Teen with much older boyfriend",
  "k": "ACD",
  "s": "A 15-year-old attends for an emergency appointment with a man who says he is her 24-year-old boyfriend. He answers questions for her, keeps hold of her phone and says they need to be quick. She seems anxious, avoids eye contact and mentions she hasn’t been at school ‘for a while’.",
  "o": [
   [
    "Find a reason to see her on her own, for example by asking him to wait in reception while you examine her.",
    "Seeing her alone gives her a safe chance to talk and lets you assess her without alerting him."
   ],
   [
    "Share your concerns with her GP by phone today, since her missing school may already be known to them.",
    "Her GP may help later, but sharing outside the safeguarding procedure bypasses the lead and her confidentiality."
   ],
   [
    "Speak to the practice safeguarding lead the same day about a referral to children’s social care.",
    "An adult in a relationship with a 15-year-old is a serious child protection concern that needs a prompt referral."
   ],
   [
    "Record factually what you saw and what each of them said, including his name and the time they attended.",
    "Precise, factual notes support the referral and any later investigation by social care or the police."
   ],
   [
    "Contact her parents after the appointment, using the details on her record, to tell them who she came with.",
    "It feels natural, but you do not know her family situation, and acting outside procedure could raise the risk."
   ],
   [
    "Provide only the emergency care today and ask that a parent or guardian comes with her for further treatment.",
    "It sounds cautious, but it may stop her returning and does nothing about the concern you already have."
   ],
   [
    "Treat her as planned and add a note to look out for further signs at her next visit before deciding what to do.",
    "Waiting leaves a child at risk when you already have enough to act on today."
   ],
   [
    "Ask her gently, while he is present, whether she feels safe at home and whether anything is worrying her.",
    "Asking is right, but with him present she is unlikely to answer freely and he is alerted."
   ]
  ],
  "tk": "Possible exploitation: create a safe moment alone, record precisely and refer through the safeguarding lead the same day; don’t wait or go round the procedure."
 }
];

const RW_3_2 = [
 {
  "t": "rank",
  "d": "I",
  "g": "F",
  "a": "Treatment plan emailed wrongly",
  "k": "CEBDA",
  "s": "At the end of a busy day you email a treatment plan, including a summary of the patient’s medical history, to a patient. Minutes later you realise that the email address autocompleted to a different patient with the same surname. The practice manager, who is the practice’s data protection lead, is still in the building, and the practice’s email system has a recall function.",
  "o": [
   [
    "Use the recall function and, if it reports success, send the plan to the right patient and treat the matter as resolved.",
    "Recall can’t be verified for an outside address, and treating it as resolved means the lead never assesses whether the breach is reportable and the patient isn’t told."
   ],
   [
    "Phone the patient whose details were sent, explain what has happened and apologise before she learns of it another way.",
    "Candour matters and she must be told, but it follows alerting the lead and containing the breach, so you can also say what is being done about it."
   ],
   [
    "Go to the practice manager now, as data protection lead, and follow her direction on containing and logging the breach.",
    "She is on site and can direct containment and decide whether the ICO must be told within the time limit, so she should hear first."
   ],
   [
    "Record the error in both patients’ notes tonight and raise it with the practice manager first thing tomorrow morning.",
    "Documenting and reporting are right, but leaving it overnight loses the best chance to contain the breach while the manager is still available."
   ],
   [
    "Phone the recipient, explain the email was misdirected and ask her to delete it and confirm she has not passed it on.",
    "Prompt containment limits harm, but the data protection lead should know first and may want to coordinate how the recipient is approached."
   ]
  ],
  "tk": "With your own data breach, the data protection lead on site comes first, then containment, then the affected patient; a recall handled alone or a report left until morning both fall short."
 },
 {
  "t": "best3",
  "d": "T",
  "g": "F",
  "a": "Identifiable photos in a talk",
  "k": "BDH",
  "s": "At a study day, a fellow FD shows you the slides for a case presentation she is giving in an hour. Several slides show full-face photographs of her patient, and one includes a screenshot of his clinical record with his name visible. She says he agreed to photographs ‘for his records’ and that the audience is only other dentists.",
  "o": [
   [
    "Suggest she asks the study-day lead to move her talk later in the day so she has more time to edit the slides.",
    "Extra time does not help unless the slides change, and the edits needed are quick enough to make within the hour."
   ],
   [
    "Explain privately that consent to photos for his records does not extend to teaching, and his name must not appear.",
    "A quiet, specific word gives her the reason and the chance to put it right herself, which is the proper first rung."
   ],
   [
    "Suggest she keeps the slides but asks the audience not to photograph or share them during or after the talk.",
    "It limits onward spread but does not stop everyone in the room identifying him, which is the breach itself."
   ],
   [
    "Offer to help her crop or blur the photos and remove the record screenshot so that he cannot be identified.",
    "It fixes the problem practically before she presents and keeps the teaching value of the case."
   ],
   [
    "Suggest she phones the patient now to ask for his verbal consent to use the images for teaching purposes.",
    "Tempting, but consent rushed over the phone is doubtful and would never justify showing his record and name."
   ],
   [
    "Advise her to phone her defence organisation for advice on the consent issue before she gives the talk.",
    "The issue is clear and fixable locally, so seeking outside advice uses up the time she needs to edit the slides."
   ],
   [
    "Mention your concern to her ES afterwards, so it can be picked up as a learning point in her next tutorial.",
    "Learning from it is useful, but raising it only afterwards lets the breach go ahead when it could be prevented."
   ],
   [
    "If she decides to present the slides unchanged, raise it with the study-day lead before the session starts.",
    "Escalating only if she will not act, and before the breach happens, is the next rung and protects the patient."
   ]
  ],
  "tk": "A colleague’s imminent confidentiality breach is best stopped by a private word and practical help, with escalation before the talk only if she won’t change the slides."
 },
 {
  "t": "rank",
  "d": "E",
  "g": "F",
  "a": "Patient with seizures still driving",
  "k": "BDECA",
  "s": "A patient tells you that his epilepsy has become poorly controlled, with two seizures in the past month, and asks you to update his medical history. When you ask, he says he still drives every day because he would otherwise lose his job, and he has not told the DVLA. He asks you to keep this between the two of you, and says he is seeing his GP next month.",
  "o": [
   [
    "Respect his wish for privacy, update his history and suggest he raises his driving with his GP at next month’s visit.",
    "It treats driving as a matter for his GP and leaves a month of daily driving with uncontrolled seizures, a serious risk to others."
   ],
   [
    "Explain that he has a legal duty to stop driving and tell the DVLA, and talk through the risk to himself and others.",
    "Persuading him to act himself respects his autonomy and tackles the risk, and must come before any disclosure is considered."
   ],
   [
    "Tell him you will need to inform the DVLA yourself, and contact them after he leaves today if he will not do so.",
    "Telling him first is right, but disclosing today before persuasion and senior advice have been tried is premature."
   ],
   [
    "Explain that if he keeps driving you may need to tell the DVLA, and seek your ES’s advice on the next step.",
    "Being honest about the limits of confidentiality and taking advice before any disclosure is the sound next step."
   ],
   [
    "Offer, with his consent, to write to his GP today about his poor seizure control so it can be reviewed sooner.",
    "Supportive and speeds up medical review, but on its own it relies on him choosing to stop driving."
   ]
  ],
  "tk": "When a patient’s driving endangers the public, persuade them first and be honest that you may have to disclose, taking advice before any disclosure rather than rushing to it or leaving it to the GP."
 },
 {
  "t": "best3",
  "d": "T",
  "g": "F",
  "a": "Patient data in staff WhatsApp",
  "k": "BCE",
  "s": "Your practice has a staff WhatsApp group, set up by the practice manager, for rota changes. The receptionist often posts photos of the day list showing patients’ names and treatments so staff can ‘see who’s in’, and yesterday a nurse posted a photo of an unusual lesion, with part of the patient’s face visible, and a light-hearted caption.",
  "o": [
   [
    "Post a general reminder in the group that patient details should not be shared there, without naming anyone.",
    "Tactful, but it leaves the existing posts in place and does not fix the day-list habit at its source."
   ],
   [
    "Speak privately to the receptionist and the nurse, explain that the posts identify patients and ask them to delete them.",
    "A quiet word gets the most harmful posts removed quickly and gives colleagues the chance to put it right themselves."
   ],
   [
    "Tell your ES about the group today and ask for advice on how best to approach the team about it.",
    "Telling your ES promptly brings in the supervisor responsible for your training, who can help you handle a team-wide conduct and data-protection problem well."
   ],
   [
    "Tell the patient whose lesion was photographed that his image was shared, so he hears about it from the practice.",
    "He may need to be told, but that decision belongs to the practice’s breach process once the facts are clear."
   ],
   [
    "Raise the group with the practice manager and suggest a secure, approved way to share the day list.",
    "The day-list habit is a system problem, and the manager who set up the group can change the process and decide whether formal breach handling is needed."
   ],
   [
    "Ask your defence organisation whether being a member of the group puts your own registration at risk.",
    "Your own registration matters least here, and the advice would do nothing for the patients whose data is being shared."
   ],
   [
    "Leave the group and ask to receive rota changes by email, so you are not party to the posts.",
    "It protects you but does nothing about the patient information already shared or still being posted."
   ],
   [
    "Stop posting anything about patients yourself and send rota queries through the practice’s secure system.",
    "Good personal practice, but nothing suggests you post about patients, so it does nothing about the lesion photo or the day-list habit."
   ]
  ],
  "tk": "Everyday data leaks on staff chats need a prompt private word, a system fix through the manager and your own good practice, rather than self-protection or waiting for a tutorial."
 },
 {
  "t": "rank",
  "d": "I",
  "g": "N",
  "a": "Patient’s exemption no longer valid",
  "k": "CADEB",
  "s": "An NHS patient is about to sign the form for a course of fillings and has ticked that she receives Universal Credit and is exempt from charges. While chatting, she mentions that her Universal Credit stopped two months ago when she started a new job, but says ‘nobody checks, and money is really tight’. She has two teeth causing her pain.",
  "o": [
   [
    "Mention help she may qualify for, such as the NHS Low Income Scheme, and discuss prioritising the painful teeth first.",
    "It meets her real money worries and keeps her in care, but it supports rather than replaces an accurate form."
   ],
   [
    "Accept the form today, and ask reception to check her exemption status before she comes back for the next visit.",
    "Checking later still processes a claim you already know is wrong, which leaves her open to a penalty."
   ],
   [
    "Explain kindly that the form must match her current situation, as a wrong claim risks a penalty, and ask her to amend it.",
    "It is honest, protects her from a penalty charge and keeps the claim accurate without judging her."
   ],
   [
    "Let the practice manager know what she said, so the correct charge band can be applied to this course of treatment.",
    "The practice collects charges and should know, but helping her correct the form herself comes first and may settle it."
   ],
   [
    "Suggest she postpones signing and her treatment until she has checked her eligibility on the NHS website.",
    "Honest, but her eligibility is already clear and waiting delays care for teeth that are causing her pain."
   ]
  ],
  "tk": "A patient’s mistaken exemption claim should be corrected kindly and at once, with help offered on costs; checking it later or delaying her care are weaker answers."
 },
 {
  "t": "best3",
  "d": "T",
  "g": "N",
  "a": "Private list in tutorial time",
  "k": "CEG",
  "s": "Your DFT contract says that you provide NHS care only and that your Thursday afternoon tutorial with your ES is protected. The practice manager tells you she has booked three private patients into that slot this week because the associate is away, saying the practice ‘needs the income’ and your ES ‘won’t mind’. Your ES is on leave until Wednesday.",
  "o": [
   [
    "See them this week as a one-off, and raise the general principle with your ES when they return on Wednesday.",
    "Understandable under pressure, but it breaches both your NHS-only terms and your protected training time."
   ],
   [
    "Offer to see the three patients after your normal hours instead, so that your tutorial time is kept.",
    "It saves the tutorial but gives up your own time and still breaks the NHS-only terms of your contract."
   ],
   [
    "Explain politely to the practice manager that you can’t see them, as tutorial time is protected and you provide NHS care only.",
    "A courteous refusal with the reasons is the right first response to a request you cannot accept."
   ],
   [
    "Contact the TPD today for a ruling, since your ES is away and the list is booked for Thursday.",
    "The ES is back before Thursday and is the right first step, and the TPD is the next rung only if this can’t be settled."
   ],
   [
    "Email your ES so they know before Thursday and can discuss it with the practice manager on their return.",
    "The ES is responsible for protecting your training and can resolve it with the manager in good time."
   ],
   [
    "Ask the practice manager to confirm the request by email, so you have a written record before deciding.",
    "A record is sensible, but the answer is already clear, so this delays a decision the manager needs now."
   ],
   [
    "Suggest the patients are offered another dentist or another day, so they are not left without care.",
    "It takes the patients’ needs seriously and gives the practice a practical way forward."
   ],
   [
    "Offer to move your tutorial to Friday and see NHS patients from the associate’s list on Thursday instead.",
    "Well meant, but training arrangements are for your ES to change, and it does not solve the private bookings."
   ]
  ],
  "tk": "When practice pressure clashes with training rules, decline politely, tell your ES and help the patients find another slot, rather than rearranging your training or giving up your own time."
 },
 {
  "t": "best3",
  "d": "I",
  "g": "N",
  "a": "Lab technician offers incentives",
  "k": "ACE",
  "s": "A technician from a new dental laboratory visits and offers you personally a free set of whitening trays for every ten cases you send, plus a spa voucher at Christmas. His prices are a little lower than your current laboratory’s, but nobody at the practice has used his work before. The practice owner normally decides which laboratories the practice uses.",
  "o": [
   [
    "Decline the personal incentives politely, explaining they could influence, or seem to influence, your choices.",
    "A reward tied to how many cases you send is a conflict of interest, and declining it protects patients’ trust."
   ],
   [
    "Accept the trays only if you declare them in the practice’s gifts register, so the arrangement is transparent.",
    "Declaring it is open, but the reward still depends on how many cases you send, so the conflict remains."
   ],
   [
    "Tell the practice owner about the offer, including the personal incentives, as the choice of laboratory is theirs.",
    "It is open, respects who makes the decision and lets the owner judge the offer on full information."
   ],
   [
    "Suggest he offers the practice a bulk discount instead of personal rewards, and pass that proposal to the owner.",
    "Well meant, but negotiating terms on the owner’s behalf goes beyond your role before the owner has even decided."
   ],
   [
    "If the practice does try his laboratory, judge his work on fit, quality and suitability for patients, not price.",
    "Choosing laboratory work on patients’ interests alone is the principle that removes any conflict."
   ],
   [
    "Send him one trial case to assess the quality of his work before mentioning him to the practice owner.",
    "Testing quality is sensible, but sending patients’ work to a new laboratory is the owner’s decision, not yours."
   ],
   [
    "Ask your defence organisation whether you are obliged to report the offer to the GDC as an inducement.",
    "Declining and telling the owner deals with this, so outside advice about regulators is disproportionate for now."
   ],
   [
    "Accept only the Christmas voucher, treating it as an ordinary seasonal gift from a supplier to the practice.",
    "It is part of an offer linked to referrals and made to you personally, so it is not an ordinary gift."
   ]
  ],
  "tk": "With an incentive linked to your referrals, decline it, tell whoever decides and choose on patient benefit; declaring or partly accepting it does not remove the conflict."
 },
 {
  "t": "best3",
  "d": "T",
  "g": "R",
  "a": "Fellow FD dating a patient",
  "k": "BDG",
  "s": "Over lunch, a fellow FD tells you she has started dating one of her current patients, whom she is halfway through treating for two crowns. She says it is ‘nobody’s business’ because they met socially, not at the practice. You are friends, and she asks you not to mention it to anyone.",
  "o": [
   [
    "Tell her ES in confidence today, so they can support her before the situation becomes a problem.",
    "Well meant, but it skips giving her the chance to raise it herself, which she may do once she sees the issue."
   ],
   [
    "Explain as a friend that dating a current patient crosses professional boundaries, however they met.",
    "An honest private word is the first rung and what a good friend and colleague would offer."
   ],
   [
    "Suggest she reads the GDC guidance on boundaries and then decides for herself what she should do next.",
    "It points her to the right source but leaves the decision open, when the conflict needs resolving now."
   ],
   [
    "Encourage her to speak to her ES about transferring his care to another dentist at the practice.",
    "Transferring his care ends the conflict and lets her keep ownership of how it is handled."
   ],
   [
    "Suggest she finishes the two crowns first and then transfers his care to another dentist afterwards.",
    "Tempting for continuity, but the conflict continues for as long as she keeps treating him."
   ],
   [
    "Suggest she contacts her defence organisation for advice before she does anything else about it.",
    "Advice can help, but the fix is clear and local, so this delays her talking to her ES."
   ],
   [
    "If she won’t raise it herself, tell her that you will need to speak to her ES about it.",
    "Being open about your next step protects the patient and gives her a last chance to act first."
   ],
   [
    "Offer to take over his remaining treatment yourself, so she can step back from his care straight away.",
    "Kind, but changing his care is for the practice to arrange through her ES, not something to settle between friends."
   ]
  ],
  "tk": "When a colleague crosses a boundary with a patient, speak to them first, point them to their ES to transfer care and tell them honestly you will escalate if they won’t."
 }
];

const RW_3_3 = [
 {
  "t": "rank",
  "d": "T",
  "g": "R",
  "a": "Inheriting a colleague’s poor notes",
  "k": "CADEB",
  "s": "You take over the care of a patient from an associate who left the practice last month to work nearby. His notes for her last two visits are brief and partly illegible, with no record of a medical history check or of the anaesthetic used, and she says a filling was ‘started but never finished’. She is keen to get the tooth sorted today. You notice that three of his other patients have similarly sparse notes.",
  "o": [
   [
    "Explain to her that the earlier records are incomplete, so you will need to reassess the tooth before carrying on.",
    "Being open about the gaps is honest and supports her consent to reassessment, though on its own it does less than actually reassessing her."
   ],
   [
    "Hold off treating her until the associate has replied, so that you have his full account before you start.",
    "His account may help, but her care should not wait on someone else when your own history and examination can make it safe today."
   ],
   [
    "Take a full history and examine her today, then plan her care from your own findings in a new dated entry.",
    "Her safety today does not depend on the old notes if you reassess her yourself, and a full history, examination and dated record are squarely within your competence."
   ],
   [
    "Raise the sparse notes across his other patients with your ES, so the practice can decide whether a wider review is needed.",
    "Sparse notes across several patients may put others at risk, so the practice needs to know, and this matters more than filling in the details of one visit."
   ],
   [
    "Contact the associate at his new practice, explain the gaps and ask what he did and which anaesthetic he used.",
    "What he tells you may be useful, but once you have reassessed her it adds little to her safety, and the wider pattern should not wait on his reply."
   ]
  ],
  "tk": "With inherited poor records, your own assessment makes the patient safe today; the colleague and then the ES follow, and waiting on others should not delay care."
 },
 {
  "t": "rank",
  "d": "I",
  "g": "R",
  "a": "Associate hides separated file",
  "k": "AEDBC",
  "s": "A nurse tells you, visibly upset, that yesterday an associate separated a file in a patient’s canal and told the patient ‘everything went fine’. She says he asked her not to mention it, and you can see it is not recorded in the notes. The associate is senior to you and a close friend of the practice owner, who is your ES.",
  "o": [
   [
    "Tell your ES today what the nurse has reported, with her agreement, so the patient can be told and the notes corrected.",
    "Deliberate concealment justifies going promptly to the person responsible for the practice, who must make sure the duty of candour is met."
   ],
   [
    "Speak to the associate privately and ask him to contact the patient and correct the notes today.",
    "A private word is usually the first rung, but he has already concealed the error and pressured the nurse, so warning him risks further concealment and exposes her."
   ],
   [
    "Look at the post-operative radiograph yourself to confirm that a file was separated before raising anything.",
    "It delays the patient being told, oversteps your role and means accessing records without a clinical reason; the nurse’s first-hand account is enough to act on."
   ],
   [
    "Phone the TPD for advice first, given how close the associate is to your ES and practice owner.",
    "The close friendship is a genuine conflict of interest, so TPD advice is a legitimate and protected route, although it is slower than going straight to the ES."
   ],
   [
    "Support the nurse to write down what she saw and heard, and to raise it under the whistleblowing policy.",
    "As the witness she should be supported to speak up formally, but relying on her alone may be slower than raising it yourself."
   ]
  ],
  "tk": "Concealment justifies skipping the private word: take it promptly to the responsible senior and support the witness, rather than investigating yourself or jumping a rung."
 },
 {
  "t": "rank",
  "d": "I",
  "g": "H",
  "a": "Hungover before a clinic",
  "k": "CDAEB",
  "s": "You wake at 7am after a friend’s birthday, having drunk heavily until about 2am. You feel nauseous, have a pounding headache and are unsure whether you are still over the drink-drive limit. Your list starts at 8:30 and includes two extractions, and your ES is in the practice today.",
  "o": [
   [
    "Phone reception early to cancel your morning list, and explain the reason to your ES when she arrives.",
    "Patients are protected and you are honest, but you have made the decision alone and cancelled patients whom your ES might have arranged for a colleague to see."
   ],
   [
    "Drink plenty of water, take a taxi in and decide before your first patient whether you feel fit to work.",
    "Avoiding the car is sensible, but you cannot reliably judge your own fitness while you may still be intoxicated, and patients would be at risk."
   ],
   [
    "Phone your ES before clinic, explain that you drank heavily and may not be fit to treat, and agree a plan.",
    "It protects patients, is fully honest and lets your ES make a timely decision about your list before anyone is booked in front of you."
   ],
   [
    "Take a taxi in early, tell your ES in person how much you drank, and let her decide whether you can work.",
    "Honest and involves your ES, but leaves less time to reorganise the list than phoning ahead, and means arriving at work possibly still impaired."
   ],
   [
    "Go in, ask your ES to take the two extractions, and see only check-ups until you feel better.",
    "It removes the highest-risk procedures, but you would still be examining and advising patients while possibly impaired."
   ]
  ],
  "tk": "When you may be unfit to practise, tell your supervisor the full reason early enough to act; deciding alone or scaling down your list is less safe."
 },
 {
  "t": "best3",
  "d": "P",
  "g": "H",
  "a": "Your own low mood",
  "k": "BEG",
  "s": "For about six weeks you have felt low, slept badly and dreaded going to work. Last week you forgot to send an urgent referral, and yesterday you nearly started treatment without checking an updated medical history. At your interim review, the TPD asks how you are finding the year.",
  "o": [
   [
    "Ask for longer appointments for now, so you have time to double-check your work.",
    "It may reduce errors in the short term, but it moves the pressure onto the diary without addressing the cause."
   ],
   [
    "Tell the TPD honestly how you have been feeling and about the two near-misses.",
    "Honesty now opens the door to support and protects patients, and the TPD is the right person to hear it."
   ],
   [
    "Ask your nurse to check each medical history with you until you feel better.",
    "A useful safety net, but it relies on a colleague to catch your errors and leaves your health unaddressed."
   ],
   [
    "Take a week of annual leave to rest before the second half of the year.",
    "Rest may help, but with no plan or support in place the same problems are likely to return."
   ],
   [
    "Book an appointment with your GP to talk about your mood and sleep.",
    "Seeking help for your own health is a professional responsibility, and your GP can assess and treat what is happening."
   ],
   [
    "Tell the TPD you have been under strain, and go through the details with your ES next week.",
    "It starts the conversation, but holding back the near-misses from the person asking delays support while patients remain at risk."
   ],
   [
    "Agree with the TPD and your ES what support would help, such as occupational health.",
    "It turns honesty into a practical plan that keeps both you and your patients safe."
   ],
   [
    "Write a reflection on the missed referral and discuss it at your next tutorial.",
    "Reflecting is worthwhile, but it treats the errors as isolated when the underlying cause is your health."
   ]
  ],
  "tk": "When your health is affecting your work, full honesty, medical help and an agreed support plan matter more than workarounds, rest or reflection alone."
 },
 {
  "t": "rank",
  "d": "E",
  "g": "M",
  "a": "Patient recording the consultation",
  "k": "DABCE",
  "s": "Halfway through explaining treatment options to a patient who is unhappy with a previous filling, you notice his phone in his shirt pocket with the camera recording. When you ask about it, he says he is recording ‘in case you lot try anything’. Your nurse looks uncomfortable.",
  "o": [
   [
    "Ask whether he would angle the phone away from your nurse, since she has not agreed to be filmed.",
    "A courteous request on your nurse’s behalf that deals with a live privacy concern without challenging his right to record."
   ],
   [
    "Offer him a written summary of the options and a copy of his records to refer back to.",
    "It meets the anxiety behind the recording and supports informed consent, a helpful addition once you have engaged with his worry."
   ],
   [
    "Pause and ask the practice manager to join you, so there is a witness to the rest of the discussion.",
    "Defensive and it delays his care, but it does continue the consultation. Still better than making his care conditional on stopping the recording."
   ],
   [
    "Acknowledge the recording calmly, say you are happy to continue, and ask what has worried him.",
    "Staying calm and open lowers the tension and gets to the real problem, which is his loss of trust."
   ],
   [
    "Explain the practice’s policy on recording, and ask him to put the phone away before you continue.",
    "Patients may lawfully record their own care, and BMA guidance advises against making treatment conditional on stopping. Insisting risks escalating things and turns the focus away from his concerns."
   ]
  ],
  "tk": "When a patient records a consultation, carry on openly and address the mistrust behind it; don’t make his care conditional on stopping the recording."
 },
 {
  "t": "best3",
  "d": "P",
  "g": "M",
  "a": "Relative filming staff in reception",
  "k": "CGH",
  "s": "A man whose elderly mother’s appointment was cancelled at short notice starts raising his voice at the receptionist and filming her on his phone, saying he will ‘put this on Facebook’. Several patients, including a parent with young children, are in the waiting room. You are between patients and the practice manager is out.",
  "o": [
   [
    "Offer to rebook his mother into the first slot tomorrow, before hearing what happened.",
    "Well meant, but it bypasses the normal booking order before you know the facts and does not address his behaviour or your colleague’s distress."
   ],
   [
    "Phone the practice manager to ask her to come back or advise you on how to handle it.",
    "She should be told, but the situation needs someone present now, and the call delays that."
   ],
   [
    "Go to reception, introduce yourself calmly and invite him to talk privately about his mother.",
    "It supports your colleague, takes him and his camera out of the waiting room and addresses his real grievance."
   ],
   [
    "Suggest the receptionist takes a short break in the staff room while you cover the desk.",
    "Kind to your colleague, but it leaves the underlying situation and the filming unresolved, with you tied to the desk rather than dealing with him."
   ],
   [
    "Explain the complaints procedure and offer him a form so the practice can respond in writing.",
    "Right in due course, but leading with process can feel dismissive to someone who is upset now."
   ],
   [
    "Ask him politely to stop filming, as other patients in the waiting room could be identified.",
    "The privacy concern is fair, but a direct request to stop filming just as he threatens Facebook risks inflaming him, when moving the conversation elsewhere deals with it more safely."
   ],
   [
    "Reassure the waiting patients and offer the parent and children somewhere quieter to wait.",
    "It protects vulnerable bystanders, including young children, from a distressing scene and reassures patients who may be worried."
   ],
   [
    "If he becomes aggressive or will not calm down, follow the practice policy and call the police if needed.",
    "It sets a clear safety limit if de-escalation fails, using the proper route."
   ]
  ],
  "tk": "With an angry relative, de-escalate in person, protect others’ privacy and have a safety fallback; calls, forms and quick rebooking are secondary."
 },
 {
  "t": "rank",
  "d": "T",
  "g": "T",
  "a": "Conflicting senior instructions",
  "k": "EACBD",
  "s": "Your ES has told you always to take a periapical radiograph before starting root canal treatment. Today the practice owner, who is not your ES, sees you setting up for a patient in pain and suggests you skip it because the X-ray unit is needed next door and ‘an experienced dentist wouldn’t bother’. The patient is waiting in the chair.",
  "o": [
   [
    "Explain the short delay to the patient and let him know you will start once the radiograph is taken.",
    "It keeps the patient informed and at ease while you do the treatment properly, but it depends on first agreeing access to the unit."
   ],
   [
    "Record in the notes your reason for taking the radiograph and that the owner advised against it.",
    "Recording your clinical reasoning is fine, but noting a colleague’s view mainly protects you and does nothing for the patient waiting."
   ],
   [
    "Afterwards, ask your ES to clarify the expectation with the owner so the conflict does not recur.",
    "It prevents a repeat and keeps relationships good, but it can wait until the patient in the chair is looked after."
   ],
   [
    "Ask the owner to look at the tooth with you and decide together whether a radiograph is needed.",
    "Learning from a senior is valuable, but this defers a decision within your competence and may end with treatment going ahead without the information you need."
   ],
   [
    "Explain politely to the owner that you need a radiograph first, and ask to use the unit when it is free.",
    "Declining a senior’s suggestion is right when following it would compromise care, and waiting a few minutes is a proportionate compromise."
   ]
  ],
  "tk": "When seniors conflict, hold to the safe standard politely and keep the patient informed; handing the decision back or documenting defensively comes lower."
 },
 {
  "t": "best3",
  "d": "T",
  "g": "T",
  "a": "Hygienist’s sharp feedback",
  "k": "ADG",
  "s": "At the end of the day, the practice hygienist tells you quite sharply that your referrals to her often lack periodontal charts and clear instructions, so she has to repeat assessments and her list overruns. She adds that you ‘never even say hello’. You are tired and feel she was rude.",
  "o": [
   [
    "Thank her for raising it and acknowledge that incomplete referrals make her work harder.",
    "Accepting feedback graciously, even when it is bluntly given, keeps the working relationship open."
   ],
   [
    "Ask her for a few recent examples, so you can see exactly where the gaps have been.",
    "Examples can help, but asking for evidence first can come across as defensive when you already know the gaps."
   ],
   [
    "Offer to stay late this week to complete the missing charts for her waiting patients.",
    "Generous, but your own time is not the fix; referrals should be completed properly at the appointment."
   ],
   [
    "Agree with her what a complete referral should include, and start providing it.",
    "It fixes the practical problem at its source and improves patient care."
   ],
   [
    "Apologise, and suggest you both talk it through properly tomorrow when you are less tired.",
    "Sensible timing, but it postpones acknowledging the problem and agreeing a fix that could start now."
   ],
   [
    "Ask the practice manager to add a periodontal chart section to the referral template.",
    "A useful system change, but it goes via management before you have fixed your own referrals with her."
   ],
   [
    "Reflect on the feedback, including how you come across, and discuss it with your ES.",
    "Her comment about greeting her points to how you come across, which is worth exploring with your ES."
   ],
   [
    "Mention calmly that you found the way she raised it upsetting, so you can work well together.",
    "Honest, but raising her tone now shifts the focus from a valid concern that affects patients."
   ]
  ],
  "tk": "With blunt but valid feedback, thank them, fix the substance with them and reflect on it; debating tone, delaying or routing it elsewhere comes second."
 }
];

const RW_3_4 = [
 {
  "t": "consider",
  "d": "P",
  "g": "P",
  "a": "Late emergency near closing",
  "k": "DAECB",
  "s": "At 5:10pm, 20 minutes before closing, reception asks you to see a walk-in patient with a painful facial swelling that has grown since yesterday; he has no difficulty breathing or swallowing. Your nurse must leave at 5:30 to collect her child from nursery, the receptionist still has to cash up and pack the lab box, and you had planned to leave on time to finish a case presentation due tomorrow. Rank these considerations in order of importance.",
  "o": [
   [
    "His need to understand what you find and when to seek urgent help overnight.",
    "Whatever you do tonight, he must know the warning signs and where to go; it follows the clinical risk that decides whether he is seen at all."
   ],
   [
    "Having enough time to finish the case presentation due tomorrow.",
    "A real pressure on you, but your own deadline ranks below the patient and your colleagues and can be managed, for example by asking for a short extension."
   ],
   [
    "Keeping end-of-day tasks such as cashing up and the lab box on schedule.",
    "These tasks can be flexed, but a missed lab box delays other patients’ care and keeps the receptionist late, so they rank above your own deadline."
   ],
   [
    "The risk that the swelling spreads overnight if he is not assessed today.",
    "A spreading swelling can become dangerous, so his clinical need shapes everything else."
   ],
   [
    "Your nurse’s need to leave at 5:30, and whether another trained colleague can assist.",
    "Her childcare is a genuine team consideration and you should not treat without trained chairside support, but it comes after the patient’s needs."
   ]
  ],
  "tk": "End-of-day pressures: clinical risk first, then the patient’s understanding, then colleagues, then yourself. Routine practice tasks can nearly always wait."
 },
 {
  "t": "best3",
  "d": "P",
  "g": "P",
  "a": "Extra emergencies every lunchtime",
  "k": "BEG",
  "s": "The associate is off sick for two weeks, and the practice manager asks you to see two of his emergency patients every lunchtime on top of your own full list. On the first day you skipped lunch, ran 30 minutes late all afternoon and felt rushed during a difficult extraction. Your ES is in the practice today, and the manager says she is struggling to find a locum.",
  "o": [
   [
    "Carry on this week, taking a short break before any surgical procedure, and review it on Friday.",
    "A break helps, but it leaves the overload in place for a week after you have already felt rushed during a difficult procedure."
   ],
   [
    "Tell the practice manager you felt rushed yesterday, and agree how many extra patients you can see safely.",
    "Being clear with the person who made the request about what is safe protects patients while still helping the practice."
   ],
   [
    "Offer to start 45 minutes early each day so the emergencies are seen before your own list.",
    "Proactive and generous, but it adds to the fatigue that is already the problem and hides the true workload from the practice."
   ],
   [
    "Ask the manager to direct the associate’s emergencies to the local urgent dental service for now.",
    "It moves the problem to another service and may leave the practice’s own patients waiting longer than necessary."
   ],
   [
    "Raise it with your ES, including how emergency cover could be shared across the clinicians.",
    "Your ES oversees your workload and training and can spread the cover fairly across the team."
   ],
   [
    "Ask your TPD how much extra workload an FD can reasonably be expected to take on.",
    "Useful background, but your ES and the manager are on site and can resolve it directly, so the TPD is a rung too far for now."
   ],
   [
    "Suggest his emergency patients are triaged by phone first, so only those who need to be seen are booked.",
    "Matching appointments to clinical need may make the extra load manageable without anyone going without care."
   ],
   [
    "Ask for your afternoon appointments to be lengthened so you can absorb the extra patients.",
    "It relieves the time pressure, but only by reducing access for your own patients rather than solving the shortfall."
   ]
  ],
  "tk": "Workload creep: say what is safe to the person asking, involve your ES and match demand to clinical need. Early starts and longer slots only move the strain."
 },
 {
  "t": "consider",
  "d": "P",
  "g": "W",
  "a": "Very high blood pressure",
  "k": "DCEAB",
  "s": "A 62-year-old man attends for extraction of a painful, unrestorable lower molar. His blood pressure is 192/118 mmHg on two readings; he has no chest pain, headache or visual symptoms, and says his GP ‘keeps meaning to’ start him on tablets. He has taken a day off work, has barely slept for the pain and insists you go ahead. Rank these considerations in order of importance.",
  "o": [
   [
    "His wish, as an adult with capacity, to have the tooth out today.",
    "His autonomy matters, but a patient cannot insist on treatment you judge unsafe. You respect it by involving him in the plan rather than by going ahead."
   ],
   [
    "The cost to him of the lost day off work and a second visit.",
    "It is a real burden for him, but it is convenience and cannot outweigh the safety and health considerations."
   ],
   [
    "His need to have his blood pressure reviewed promptly by his GP.",
    "Pressure this high threatens his general health beyond the extraction, so arranging prompt medical review comes just after the immediate procedural risk."
   ],
   [
    "The risk of a medical emergency or heavy bleeding if you extract at this pressure.",
    "Most important. It is the immediate safety risk of the very procedure you are being asked to carry out."
   ],
   [
    "Controlling his pain in the meantime and explaining clearly why you are waiting.",
    "It keeps him comfortable and keeps his trust, and it makes the delay acceptable to him. It follows the two safety considerations."
   ]
  ],
  "tk": "A patient’s insistence versus clinical safety: the procedural risk decides, then his wider health and interim comfort. His wish and convenience shape the plan, not the decision."
 },
 {
  "t": "rank",
  "d": "T",
  "g": "W",
  "a": "Therapist asks beyond scope",
  "k": "CABED",
  "s": "The dental therapist asks you to add the extraction of a mobile lower permanent incisor to her prescription for a patient she is seeing this afternoon. She says the tooth is ‘barely hanging on’, that she did many permanent extractions when she worked abroad, and that it would save the patient another visit. You are fully booked but could see the patient briefly at the end of the day. You have not written many therapist prescriptions before.",
  "o": [
   [
    "Offer to assess the tooth yourself at the end of the day and extract it if appropriate.",
    "It meets the patient’s need within your own competence, although the patient waits a few hours; it follows the clear answer to her request."
   ],
   [
    "Ask your ES to decide whether the extraction can be added, as prescribing is new to you.",
    "Scope here is clear enough to apply yourself, but getting your ES’s input before anything happens is a safe use of supervision when prescribing is new to you."
   ],
   [
    "Explain that extracting permanent teeth is outside a therapist’s UK scope, so you cannot add it.",
    "Declining politely with the reason settles it now; her experience abroad does not change what she may do under GDC scope of practice here."
   ],
   [
    "Suggest she checks the GDC scope of practice guidance herself before the patient arrives.",
    "It sounds respectful of her experience, but it leaves an out-of-scope decision with her when the prescription is yours to write or withhold."
   ],
   [
    "Mention the request to your ES later so prescriptions to therapists stay within scope.",
    "Worthwhile because the misunderstanding could recur, but it reports only after the event and gives her no answer now."
   ]
  ],
  "tk": "Scope of practice is within your competence to apply: decline clearly, meet the patient’s need yourself and inform your ES afterwards rather than handing the decision up or back."
 },
 {
  "t": "rank",
  "d": "E",
  "g": "K",
  "a": "14-year-old refuses extractions",
  "k": "DBEAC",
  "s": "A 14-year-old attends for extraction of two upper premolars as part of an orthodontic plan. Before you start, she says clearly that she has changed her mind: she does not want braces and understands that her teeth will stay crowded. Her mother insists you go ahead, saying her daughter ‘will thank her later’, and points out that the orthodontic waiting list was over a year long.",
  "o": [
   [
    "Rebook the extractions for a fortnight’s time so she can think it over at home with her mother.",
    "Time to reflect sounds kind, but rebooking presumes she will change her mind and leaves her under pressure without her view being properly explored."
   ],
   [
    "Explain to her mother that, as the treatment is elective, you will not extract today against her wishes.",
    "Declining the parent is right when the child appears competent and the treatment is not urgent, but it follows from first understanding the girl’s view."
   ],
   [
    "Suggest they talk it over together in the waiting room and come back in once they have agreed.",
    "It hands an irreversible decision to a family discussion in which the parent is likely to prevail, without you assessing her understanding."
   ],
   [
    "Talk with her about her reasons, checking she understands what leaving her teeth crowded means.",
    "It assesses her understanding, in effect her Gillick competence, and takes her view seriously before anything irreversible happens."
   ],
   [
    "Suggest the family goes back to the orthodontist to discuss the plan and any alternatives.",
    "The orthodontist designed the plan and can explore options with both of them, but it comes after dealing with the situation in the room."
   ]
  ],
  "tk": "A competent young person refusing elective treatment: explore her understanding yourself, then decline the parent calmly. Delays and family negotiation can become quiet pressure."
 },
 {
  "t": "best3",
  "d": "E",
  "g": "K",
  "a": "Carer wants full clearance",
  "k": "BDF",
  "s": "A 45-year-old man with a severe learning disability lives in supported housing and lacks capacity to consent to dental treatment; nobody holds a lasting power of attorney or deputyship for him. He has several decayed but restorable teeth and becomes very anxious in the chair. His carer says the team would like ‘all his teeth out under a general anaesthetic’ so there are ‘no more problems’, and that his sister, who visits weekly, agrees.",
  "o": [
   [
    "Ask his sister, as his closest relative, to sign the consent form on his behalf.",
    "Involving her is right, but without a lasting power of attorney or deputyship she has no legal authority to consent for him."
   ],
   [
    "Make a best-interests decision yourself after consulting his sister and his carers.",
    "Under the Mental Capacity Act the treating clinician makes the decision, informed by the people who know his wishes and values."
   ],
   [
    "Ask his GP to chair a best-interests meeting and make the decision about his treatment.",
    "A meeting may help, but the decision about dental treatment belongs to the dentist proposing it, not the GP."
   ],
   [
    "Explain to the carer that removing restorable teeth is unlikely to be in his best interests.",
    "Declining a request that does not serve the patient is right, even when it comes from the people who care for him."
   ],
   [
    "Request an independent mental capacity advocate before any decision is made.",
    "An advocate is needed when there is nobody appropriate to consult, but his sister is involved, so this mainly adds delay."
   ],
   [
    "Refer him to the special care dental service to assess options such as sedation.",
    "It offers a way to restore his teeth despite his anxiety, which is the least restrictive way to meet his needs."
   ],
   [
    "Offer to extract only the teeth that are hardest to keep clean, as a compromise with the team.",
    "It sounds balanced, but it is shaped by the carers’ convenience rather than clinical need or his best interests."
   ],
   [
    "Tell the safeguarding lead that the team’s request may amount to neglect of his oral health.",
    "The request is misguided rather than abusive, so a safeguarding referral is disproportionate and may strain the relationship his care depends on."
   ]
  ],
  "tk": "Adults who lack capacity: the treating clinician decides in their best interests after consulting those close to them, and chooses the least restrictive option. Relatives cannot sign for them."
 },
 {
  "t": "rank",
  "d": "I",
  "g": "I",
  "a": "Owner asks for fake reviews",
  "k": "DBECA",
  "s": "The practice owner, who is also your ES, messages all staff asking each person to post two five-star Google reviews this week ‘as if you were a patient’, to bury a recent negative review. He suggests using family members’ accounts if needed. He is clearly stressed about the practice’s finances, and you are keen to stay on good terms with him.",
  "o": [
   [
    "Report the request to the GDC, as it asks registrants to mislead the public.",
    "The concern is real, but nobody has posted anything yet, and going straight to the regulator skips every proportionate step."
   ],
   [
    "Suggest honest ways to lift the rating, such as a professional reply to the review.",
    "It addresses his underlying worry with a legitimate alternative. It supports the refusal rather than replacing it."
   ],
   [
    "Speak to the practice manager first to see whether other staff share your concerns.",
    "Understandable for support, but it delays a clear answer and turns an issue with him into a staff discussion before you have spoken to him."
   ],
   [
    "Reply privately and politely that you will not post reviews that are not genuine.",
    "Declining a senior’s dishonest request directly, and giving your reason, is right and keeps the conversation professional."
   ],
   [
    "Contact your TPD for advice if he continues to press staff after you have declined.",
    "The right next rung because the ES is the person involved, but it follows responding to him directly and constructively."
   ]
  ],
  "tk": "A senior’s dishonest request: decline privately, offer an honest alternative and escalate one rung, to the TPD, only if the pressure continues."
 },
 {
  "t": "best3",
  "d": "I",
  "g": "I",
  "a": "Charged with drink-driving",
  "k": "ACF",
  "s": "Driving home from a colleague’s leaving party, you are stopped by the police, breathalysed and charged with drink-driving. Your court date is next month and your solicitor thinks there may be a procedural defence. Nobody at the practice knows, and you are due at work tomorrow.",
  "o": [
   [
    "Tell your ES and TPD about the charge, and ask how it may affect your training.",
    "Your supervisors need to know about anything that affects your registration and training, and they can support you."
   ],
   [
    "Contact your defence organisation today for advice, including on how to word your declaration to the GDC.",
    "Sensible and often advised, but secondary here: the duty to tell the GDC is already clear, and seeking advice should not delay the disclosure itself."
   ],
   [
    "Tell the GDC promptly that you have been charged, without waiting for the verdict.",
    "It can feel premature with a possible defence, but GDC standards require you to report a charge, not only a conviction."
   ],
   [
    "Tell your ES now, and tell the GDC once the court has reached a verdict.",
    "Telling your ES is right, but the duty to inform the GDC starts at the charge, so waiting for the verdict is itself a probity failure."
   ],
   [
    "Tell the practice manager tomorrow so the rota can be adjusted if you are needed in court.",
    "Practical, but she is not the right first person, and the court date is a month away."
   ],
   [
    "Consider honestly whether your drinking is a concern, and seek support from your GP if so.",
    "Looking honestly at the cause shows the insight supervisors and the GDC look for, and your GP can support you if drinking is a concern."
   ],
   [
    "Tell the whole team at tomorrow’s huddle, so there are no rumours about it later.",
    "Openness is well meant, but colleagues do not need to know, and it shares more than necessary before your supervisors have advised you."
   ],
   [
    "Arrange other transport to work until the case is heard, so you do not drive meanwhile.",
    "A sensible personal step, but it does not address your professional duty to disclose."
   ]
  ],
  "tk": "Criminal charges: tell the GDC and your supervisors promptly, whatever the likely verdict, and look honestly at the cause. Advice and practicalities should not delay disclosure."
 }
];

// ---- Paper 4 · Advanced (Oct 2026): written by a multi-agent question factory; every key checked blind by three calibrated expert solvers. ----
const RW_4_1 = [
 {
  "t": "rank",
  "d": "P",
  "g": "W",
  "a": "Extraction beyond your competence",
  "k": "ABCDE",
  "s": "You are two months into DFT. Twenty-five minutes into extracting a heavily restored lower left first molar for Mrs Hale, the crown fractures at gum level, leaving both roots in the socket. You have sectioned roots only twice, each time under supervision at dental school. Your educational supervisor is off site this afternoon but can be reached by phone. Dr Okafor, an associate who regularly carries out surgical extractions, is between patients in the surgery next door. Mrs Hale is still numb but anxious, and asks what is happening.",
  "o": [
   [
    "Ask your nurse to fetch Dr Okafor so that she can assess the roots and either supervise you or complete the extraction herself.",
    "Senior help is available in person within minutes, so this keeps you within your competence and gives the best chance of finishing safely today while Mrs Hale is still numb (Std 7.2.1, 6.3.3). It beats phoning your supervisor because Dr Okafor can see the roots herself."
   ],
   [
    "Phone your educational supervisor, describe the fracture and the retained roots, and follow his advice on how to proceed.",
    "Asking for senior advice is right, but a supervisor who is off site can’t see the socket and will probably tell you to involve the colleague next door. It ranks below fetching Dr Okafor but above stopping, because the roots may still come out today."
   ],
   [
    "Explain what has happened, dress the socket and rebook Mrs Hale for a session when your supervisor can oversee removal of the roots.",
    "Stopping safely and coming back with supervision is a sound fall-back, but it leaves Mrs Hale with retained roots and a second anxious visit when on-site help is available now. Keeping her care in the practice puts it just above an outside referral."
   ],
   [
    "Explain what has happened, dress the socket and refer Mrs Hale to the local oral surgery service for surgical removal of the roots.",
    "Referral is safe and allowed (Std 6.3.3), but it adds a waiting list and a new team for a problem that can probably be solved in the building today. That is why it ranks just below rebooking with your supervisor."
   ],
   [
    "Section the roots yourself using the technique you were taught, working slowly and dressing the socket if either root will not move.",
    "This sounds careful, but it is working beyond your competence without direct supervision while help is next door, risking a fractured or displaced root (Std 7.2.1). It sits at the bottom however much you want to finish."
   ]
  ],
  "tk": "When a procedure goes beyond your competence, get senior help that can see the patient now; phone advice, stopping safely and referral come next, and carrying on alone comes last.",
  "r": [
   "7.2.1",
   "6.3.3",
   "7.2.2"
  ]
 },
 {
  "t": "best3",
  "d": "T",
  "g": "W",
  "a": "Pressured to provide sedation",
  "k": "ABC",
  "s": "Six months into DFT, the practice owner asks you to give inhalation sedation this afternoon to Leo, a nervous 9-year-old booked for two fillings, because the practice’s usual sedationist is off sick. You observed inhalation sedation as a student but have not done the postgraduate sedation training. The owner is not sedation-trained either. Leo and his mother are already on their way, and the owner says they will be very disappointed if the visit is wasted. Your educational supervisor is on a course today but answers messages at breaks.",
  "o": [
   [
    "Tell the owner you can’t provide inhalation sedation because you haven’t done the postgraduate training it requires.",
    "Sedation needs specific postgraduate training, and no one can override your judgement of your own competence, so declining and saying why is the essential first step (Std 7.2.1, 6.3.2). Giving the reason also lets the owner plan cover properly."
   ],
   [
    "Phone Leo’s mother now to explain honestly that sedation can’t go ahead today, and apologise for the change of plan.",
    "Leo’s mother deserves a prompt, honest explanation and an apology from you before they arrive, not a surprise at the desk (Std 1.3). It also gives her the chance to prepare Leo for a different kind of visit."
   ],
   [
    "See Leo as booked to assess him and do only what is suitable without sedation, and rebook him with a trained sedationist.",
    "Seeing Leo still makes the trip worthwhile: you can assess him, build trust and give prevention or other care that needs no sedation, while a trained sedationist does the fillings later. With declining and phoning his mother, it completes the response."
   ],
   [
    "Agree to the sedation only if the owner stays in the surgery throughout and the emergency drugs and oxygen are checked first.",
    "The checks sound like safeguards, but the owner isn’t sedation-trained, so his presence adds no competent supervision and you would still be sedating a child beyond your training (Std 7.2.1, 6.3.2)."
   ],
   [
    "Message your educational supervisor to explain the situation and ask him to speak to the owner on your behalf.",
    "Your supervisor should hear about this, but the decision is yours to make and to say now; asking him to deal with the owner from a course delays it and moves the problem rather than owning it."
   ],
   [
    "Do both fillings today under local anaesthetic alone, using behaviour management, so that Leo’s visit isn’t wasted.",
    "This is a near-miss of seeing Leo anyway: it overreaches by doing the full treatment a nervous child was booked to have under sedation, without his mother agreeing to the change, risking a distressing visit and lost trust (Std 3.1)."
   ],
   [
    "Record the episode in your PDP as a learning need and ask your supervisor about postgraduate sedation training.",
    "Planning training is worthwhile, but it does nothing for Leo or his mother today, so it falls just outside the three actions that deal with the problem now."
   ],
   [
    "Ask a receptionist to phone Leo’s mother, explain that sedation is off and offer her a new date with the sedationist.",
    "This avoids a wasted trip, but it hands the explanation to a receptionist and cancels a visit at which you could still assess Leo; phoning his mother yourself and seeing him as booked do both jobs better."
   ]
  ],
  "tk": "Don’t provide a service you aren’t trained for, whatever the pressure; decline and say why, be honest with the family yourself, and still offer the care you can safely give.",
  "r": [
   "7.2.1",
   "6.3.2",
   "1.3"
  ]
 },
 {
  "t": "rank",
  "d": "E",
  "g": "K",
  "a": "Pregnant patient declines radiograph",
  "k": "ABCED",
  "s": "Eight months into DFT, you see Mrs Ahmed, who is 20 weeks pregnant. Her lower right first molar has a large, deep restoration, has ached for a week and is tender to bite, with a small gum swelling beside it. She has no facial swelling or fever. You need a periapical radiograph to decide whether root canal treatment or extraction is the better option. She declines it because she is worried X-rays could harm the baby, and asks whether you really think it is necessary.",
  "o": [
   [
    "Explain the dose, why you need the image and the alternatives, check her understanding, then respect her decision with interim care.",
    "She has asked you directly, and you are best placed to explain the very low dose, the benefit and the options, including waiting (Std 2.2.1, 3.1.3). Once she understands, her choice stands, with interim care to keep her safe."
   ],
   [
    "Suggest she talks the radiograph through with her midwife first, giving interim pain advice and booking a review next week.",
    "The midwife can support her, but this hands over a question you can answer yourself and delays the diagnosis by a week. It ranks above simply accepting the refusal because it keeps the decision open and gets her worry answered."
   ],
   [
    "Respect her refusal, record it, give interim pain advice and book a review in two weeks to see how the tooth is settling.",
    "Respecting her choice and reviewing her keeps her safe in the short term, but the refusal rests on a worry you haven’t addressed, so it isn’t properly informed (Std 3.1.5). It is passive rather than harmful, so it sits above pressuring her or treating without a diagnosis."
   ],
   [
    "Recommend extracting the tooth today on the clinical signs, since removing it deals with the infection without a radiograph.",
    "Extraction is irreversible, removes the option of saving the tooth and goes ahead without the information needed to assess the roots, so any consent isn’t informed by the real options (Std 2.2.1, 3.1). Decisive-sounding but harmful, it ranks lowest."
   ],
   [
    "Explain that you can’t plan any treatment without a radiograph, so she will need to agree to one before her next appointment.",
    "Making further care depend on accepting the radiograph pressures her choice and leaves a pregnant patient with a possible infection without interim care (Std 3.1.5). It ranks above extraction only because nothing irreversible is done."
   ]
  ],
  "tk": "A refusal is only informed if the patient has the facts; explain the risks, benefits and alternatives yourself, then respect her choice and keep her safe in the meantime.",
  "r": [
   "3.1.5",
   "2.2.1",
   "3.1.3"
  ]
 },
 {
  "t": "rank",
  "d": "I",
  "g": "N",
  "a": "Your name used to sell plans",
  "k": "ABCED",
  "s": "You are nine months into DFT at a mixed practice, and your contract covers NHS care only. The practice owner, who is not your educational supervisor, has started paying staff £20 for each NHS patient who joins the practice’s private membership plan. This morning you overhear a receptionist telling two of your NHS patients at the desk that you ‘recommend the plan’ for them. You have never discussed the plan with either patient. Your educational supervisor is in the practice today.",
  "o": [
   [
    "Speak to the receptionist privately, explaining that you haven’t recommended the plan and asking her not to say that you have.",
    "Your name is being used to steer patients today, and the most direct, proportionate fix is a private word with the person doing it, explaining why it misleads them (Std 1.7.4, 1.3.1). It comes first because it stops the misrepresentation at source without going over her head."
   ],
   [
    "Raise the bonus scheme with your educational supervisor, explaining your concern that NHS patients are being steered to private care.",
    "The incentive itself risks pushing NHS patients into private care, which a receptionist can’t change, so your supervisor needs to know (Std 1.7.4, 8.2.3). It ranks just below the private word only because that deals with the immediate misuse of your name first."
   ],
   [
    "Tell each NHS patient you see that the plan is optional, that you haven’t recommended it, and that their NHS care won’t change.",
    "Making sure your patients know their NHS options is patient-centred (Std 1.7.2), but it has to be repeated at every appointment while the scheme and the receptionist’s script continue. It is a partial measure, so it sits below dealing with the cause."
   ],
   [
    "Treat the scheme as the owner’s business decision, and make sure your own notes record that you offered each patient NHS care.",
    "Protecting your own records looks prudent, but it lets patients go on being misled in your name and accepts an incentive that conflicts with their interests (Std 1.7.1). Putting your own position ahead of theirs places it at the bottom."
   ],
   [
    "Ask the Local Dental Committee whether the scheme breaches NHS rules before deciding what, if anything, to raise in the practice.",
    "Advice can help later, but you don’t need a ruling to correct a false statement about you or to tell your supervisor, so this delays action you can take today. As advice rather than action, it ranks above only the self-protective option."
   ]
  ],
  "tk": "When your name is used to push patients towards private care, correct it directly with the person and raise the incentive with your supervisor; protecting yourself while patients are misled comes last.",
  "r": [
   "1.7.4",
   "1.7.1",
   "8.2.3"
  ]
 },
 {
  "t": "rank",
  "d": "I",
  "g": "N",
  "a": "Patient charged the wrong band",
  "k": "BDACE",
  "s": "You are four months into DFT in a mixed NHS and private practice. At 5.30pm, finishing your notes, you notice that Mrs Adeyemi, whom you saw at 9am, was charged the Band 3 fee, although you provided only Band 2 treatment: two fillings and a scale. The receptionist selected the wrong band when she paid, and the claim for the course has not yet been sent. Mrs Adeyemi has gone home. The practice manager, who handles refunds and claim corrections, is in her office until 6pm. Mrs Adeyemi’s next appointment with you is in five weeks.",
  "o": [
   [
    "Check the other courses of treatment you completed today to make sure no other bands were entered wrongly before the claims go.",
    "Checking today’s other bands is a sensible system check that could prevent further inaccurate claims (Std 1.3.1), but on its own it does nothing for the patient who has actually been overcharged, so it sits below both options that reach her."
   ],
   [
    "Speak to the practice manager before she leaves at 6pm so the charge and the claim are corrected and Mrs Adeyemi is phoned and refunded.",
    "The practice manager can correct the payment and the unsent claim today and arrange the refund, so the patient and the NHS are both put right promptly (Std 1.3.1, 2.4). It edges out phoning the patient yourself because it fixes the cause as well as telling her."
   ],
   [
    "Email your educational supervisor this evening, explaining the error and asking how the practice usually deals with wrong charges.",
    "Asking your supervisor is reasonable, but you already know what needs to happen and the person who can do it is in the building for another half hour, so this defers a correction you could secure today. It still beats waiting five weeks because it starts the process tonight."
   ],
   [
    "Phone Mrs Adeyemi yourself now to apologise, explain the error and tell her the practice will contact her about refunding the difference.",
    "Telling her promptly and apologising is candid (Std 1.3.1) and promises nothing you can’t deliver, but it leaves the charge and the unsent claim wrong, so the error is only half put right while the manager who could fix it is still in. It ranks above checking other courses because this patient has been overcharged now."
   ],
   [
    "Add a note to her record so that reception corrects the charge and refunds the difference when she next attends in five weeks.",
    "Recording the error is honest, but it leaves her out of pocket for five weeks, with a claim that may be sent at the wrong band, so it fails to put things right promptly (Std 1.3.1, 2.4). It sounds orderly but is the slowest response."
   ]
  ],
  "tk": "When a patient has been wrongly charged, put it right promptly through the person who can correct both the payment and the claim, rather than only telling the patient or waiting for the next visit.",
  "r": [
   "1.3.1",
   "2.4"
  ]
 },
 {
  "t": "consider",
  "d": "E",
  "g": "S",
  "a": "Removing a child not brought",
  "k": "BCADE",
  "s": "You are seven months into DFT. Reception asks you to agree to remove Leo, aged 4, from the practice list under the practice’s policy for patients who miss three appointments. Leo has extensive early childhood caries. Six months ago you referred him to the local hospital for extractions under general anaesthetic, and the hospital has since written twice to say that he was not brought. He has also missed three check-ups here this year. At his last visit his mother said that she has a new baby and no car, and that the hospital is two buses away. Leo sometimes complains of toothache.",
  "o": [
   [
    "The practice’s safeguarding procedure, and what the safeguarding lead advises about the pattern of missed appointments",
    "Following the practice procedure and taking the lead’s advice is how you act on the concern properly (Std 8.5.2), but it is the route to protecting Leo rather than the reason to, so it ranks below the two points about him."
   ],
   [
    "That a 4-year-old depends entirely on adults to bring him, so repeated missed care may be a sign of neglect",
    "A child this young can’t bring himself, so repeatedly missed care is a possible neglect indicator (Was Not Brought), which turns an attendance question into a safeguarding one (Std 8.5.1). It ranks just above his pain because it decides how the practice should respond at all."
   ],
   [
    "The pain and infection he may be living with while his decayed teeth remain untreated",
    "His untreated caries may be causing pain and infection now, which is the harm at stake and makes the concern pressing (Std 1.4.1). It sits just below his dependence on adults because that is what explains why the harm is continuing."
   ],
   [
    "The pressures on his mother, such as caring for a new baby and the difficult journey to the hospital",
    "Her circumstances matter for how support is offered and may explain the missed visits, but they are the parent’s interests and can’t outweigh the child’s welfare or the safeguarding procedure, so they sit fourth."
   ],
   [
    "The practice’s attendance policy, and the appointments lost to other patients each time he misses one",
    "The policy and the lost appointments are a real practice concern, but they serve the practice rather than Leo, and removing a child who is not being brought would penalise him for the adults’ choices, so this is least important."
   ]
  ],
  "tk": "When a young child is repeatedly not brought for care, treat it as a possible safeguarding concern about the child before applying any attendance policy.",
  "r": [
   "8.5.1",
   "8.5.2"
  ]
 },
 {
  "t": "best3",
  "d": "T",
  "g": "S",
  "a": "Bruising in a care-home resident",
  "k": "ACF",
  "s": "You are five months into DFT. Mrs Marsh, 88, who has advanced dementia, attends from her care home with a care worker for a denture review. As the care worker helps her out of her coat, you notice oval, fingertip-sized bruises on the inner side of both upper arms. The care worker says, unprompted, that Mrs Marsh bruises easily and fell last week. Mrs Marsh can’t give an account of what happened and seems settled with the care worker. Her appointment ends in 15 minutes, and she will then go back to the home with the care worker. The practice principal, who is the safeguarding lead, is in clinic until 5pm but can be caught between patients.",
  "o": [
   [
    "Record the size, shape and position of each bruise in her notes, with the care worker’s explanation in her own words.",
    "An accurate, contemporaneous description of what you saw and what was volunteered is the evidence others will rely on, and recording is the first step in the safeguarding process (Std 4.1.2). It belongs in the package with sharing and referral."
   ],
   [
    "Ask the care worker how and when the fall happened and whether the home recorded it, and note down what she tells you.",
    "Some professional curiosity is right, but she has already given her account, and pressing her for detail edges into investigating, which belongs to social care. Recording the injuries and what she volunteered does the essential job without that risk."
   ],
   [
    "Speak to the safeguarding lead between her patients, before Mrs Marsh leaves, to share your concern and agree the next step.",
    "Sharing the concern with the lead while Mrs Marsh is still in the practice lets the practice decide on referral before she goes back, and makes it the practice’s responsibility, not yours alone (Std 8.5.2). It beats waiting until 5pm because by then she is back in the setting where the harm may be happening."
   ],
   [
    "Take clinical photographs of both arms so that there is an accurate record if the bruising is investigated later.",
    "Photographs may help, but Mrs Marsh can’t consent to them, and a careful written description or body map is what is expected of the dental team, so this adds little to a good record."
   ],
   [
    "Phone the care-home manager this afternoon to ask what was recorded about the fall and how she was injured.",
    "This sounds like sensible checking, but asking the home to explain the injury is investigating, and it may alert the setting where the harm could be happening before social care is involved."
   ],
   [
    "Make or support a referral to adult social care, following the local safeguarding procedure for adults at risk.",
    "Fingertip bruising on both arms of an adult who can’t protect herself or explain it is suspected abuse, which must go to social care (Std 4.3.3, 8.5.1). This is the action that actually protects her."
   ],
   [
    "Tell the safeguarding lead about your concern when her clinic finishes at 5pm, and agree the next step with her then.",
    "This is the right person on the right day, but waiting until 5pm means Mrs Marsh is already back at the home before anyone has decided what to do, when the lead could be reached between patients now. It is a near-miss of speaking to her before Mrs Marsh leaves."
   ],
   [
    "Note the care worker’s account and book a review in two weeks to check whether the bruising has faded.",
    "Waiting to see whether the bruises fade accepts an explanation that doesn’t fit the pattern and delays protection for an adult at risk, so it is the weakest response."
   ]
  ],
  "tk": "With unexplained injuries in an adult who can’t speak for herself, recognise, record, share with the safeguarding lead while she is still with you, and refer, leaving any investigation to social care.",
  "r": [
   "8.5.1",
   "8.5.2",
   "4.1.2"
  ]
 },
 {
  "t": "rank",
  "d": "P",
  "g": "S",
  "a": "Torn frenum in a baby",
  "k": "BDEAC",
  "s": "You are nine months into DFT. Ms Carter brings her 8-month-old son, Noah, because his upper lip bled yesterday. Noah can sit with support but is not yet crawling or pulling himself up. You find a torn upper labial frenum and a small bruise on his left cheek. Ms Carter says he fell against the side of his cot. He is feeding well and seems settled. Your educational supervisor, who is the practice safeguarding lead, is with a patient next door and will be free in about ten minutes. Ms Carter says she needs to leave in about twenty minutes to collect her older child from nursery.",
  "o": [
   [
    "Ask Ms Carter to describe exactly how the fall happened, how Noah was placed in the cot and who else was at home, and record it.",
    "Noting her account matters, but probing for detail is investigating, which belongs to social care and the police, and it uses up the time before she leaves. It is still better than a review because it treats the explanation as something to be checked, not accepted."
   ],
   [
    "Ask Ms Carter to wait, and bring in the safeguarding lead as soon as she is free so a referral and same-day medical check are arranged.",
    "A bruise and frenum tear in a baby who isn’t yet mobile is a red flag, and with the lead free well before Ms Carter has to go, this secures both a referral and a medical assessment today through the practice route (Std 8.5.2, 4.3.3). It edges out phoning social care yourself because the lead is about to be free and will coordinate both."
   ],
   [
    "Record the injuries and her explanation in detail, advise on caring for the lip, and book a review in two weeks to check healing.",
    "A detailed record is good practice, but a two-week review sends a non-mobile baby home with an unexplained injury and no referral, which is the decisive flaw when the risk may be now (Std 8.5.1)."
   ],
   [
    "Phone children’s social care yourself now, while Ms Carter is still here, to refer Noah and ask how to get him a medical check, then tell the lead.",
    "Referring directly protects Noah today and would be right if the lead couldn’t be reached, but she will be free in ten minutes, before Ms Carter needs to leave, so this skips the practice route and leaves the medical check still to be arranged. It ranks above the paediatric call because it uses the statutory safeguarding route (Std 4.3.3)."
   ],
   [
    "Explain to Ms Carter that Noah should see a doctor today, and phone the local paediatric team to arrange for him to be assessed.",
    "Same-day medical assessment is needed, and arranging it clinician to clinician is better than advising a GP visit, but on its own it leaves the safeguarding referral to someone else. It sits below both options that refer."
   ]
  ],
  "tk": "Bruising in a non-mobile baby is a red flag that needs same-day action through the safeguarding lead and the local referral route, not further questioning or a later review.",
  "r": [
   "8.5.1",
   "8.5.2",
   "4.3.3"
  ]
 }
];

const RW_4_2 = [
 {
  "t": "best3",
  "d": "E",
  "g": "K",
  "a": "Parents disagree over extractions",
  "k": "ABC",
  "s": "Seven months into DFT, you are due to extract four premolars this morning for Amara, aged 13, as part of a specialist orthodontist’s plan; her braces are not due to be fitted for another two months. Her father, who has parental responsibility, consented at her last visit. At 8.30am her mother, who also has parental responsibility and is separated from the father, phones to object and asks for a second opinion first. Amara arrives with her father and says she wants to go ahead. Your educational supervisor is in the practice today.",
  "o": [
   [
    "Explore with Amara what she understands about the extractions and what she wants, including some time with her away from her father.",
    "Amara’s own understanding and wishes sit at the centre of the decision, and seeing her briefly alone helps you judge whether her view is informed and freely held (Std 3.2.4). This is the person-focused part of the response, and it informs every later step."
   ],
   [
    "Explain to Amara and her father that you won’t extract today while her parents disagree, and why a short delay won’t harm her plan.",
    "The extractions are elective and irreversible, and the braces are two months away, so pausing costs Amara nothing clinically while a reasonable request is heard (Std 3.2.1). Explaining why, to both of them, in person, keeps the delay honest and respectful."
   ],
   [
    "Contact Amara’s mother and the orthodontist to arrange a joint discussion or second opinion, and record each conversation in the notes.",
    "This answers the mother’s request directly, through the clinician who planned the treatment, and gives the family a proper forum to agree a way forward (Std 4.1.2). With exploring Amara’s wishes and postponing today, it completes the response."
   ],
   [
    "Go ahead today on her father’s consent, since one parent’s consent is normally enough, and write to her mother to explain the decision.",
    "One holder’s consent is usually legally sufficient, but this proceeds with an irreversible elective procedure in the face of a live objection when nothing is lost by waiting. It treats the legal minimum as the right course, which is why it falls outside the three."
   ],
   [
    "Go ahead today if you judge Amara Gillick competent, since her own consent would then be valid whatever her parents think.",
    "A competent child can consent, so this is a near-miss of exploring her wishes, but judging competence and operating in the same sitting, beside the parent who agrees, leaves too little room to test her decision for an irreversible step (Std 3.2.4)."
   ],
   [
    "Ask your educational supervisor to help you explain the delay to Amara and her father, and to advise on contacting her mother.",
    "Support is available, but explaining a short delay and contacting the mother are within your competence at seven months, so bringing your supervisor in moves a conversation that is yours to have. It is a near-miss of explaining the delay yourself."
   ],
   [
    "Phone Amara’s mother now to hear her concerns and explain the plan, so that you can decide with Amara and her father whether to go ahead today.",
    "Listening to the mother is right, but trying to settle a request for a second opinion within one phone call, against the clock, is mistimed and may feel like pressure. Arranging a proper joint discussion with the orthodontist does the same job better."
   ],
   [
    "Postpone today’s extractions and write to the orthodontist asking them to discuss the plan with both of Amara’s parents.",
    "Postponing is sound, but this leaves Amara and her father without an explanation from you, leaves Amara out of the discussion and answers the mother only indirectly, by letter. Explaining in person and arranging the discussion yourself covers the same ground more fully."
   ]
  ],
  "tk": "When people with parental responsibility disagree about an elective, irreversible procedure, explore the child’s own understanding, pause while nothing is lost by waiting, and arrange a proper forum to resolve it.",
  "r": [
   "3.2.4",
   "3.2.1",
   "4.1.2"
  ]
 },
 {
  "t": "rank",
  "d": "E",
  "g": "K",
  "a": "Patient withdraws consent mid-treatment",
  "k": "ABCDE",
  "s": "Four months into DFT, you are 20 minutes into root canal treatment on Mrs Kowalski’s upper left first molar. The access cavity is open and you have located two of the three canals. She raises her hand, as you agreed she could, and says she wants to stop and go home. She isn’t in pain, but says she feels shut in under the rubber dam. Your nurse is with you, your educational supervisor is in the next surgery, and your next patient is due in 25 minutes.",
  "o": [
   [
    "Stop, remove the rubber dam and sit her up, then ask what is troubling her and explain her options, including dressing and rebooking.",
    "Stopping respects her withdrawal of consent, and finding out what is wrong lets her choose with full information, whether that is a break and an adapted dam or a dressing and a new date (Std 3.1.5). It beats dressing straight away because it leaves the choice with her."
   ],
   [
    "Stop, remove the rubber dam and sit her up, then place a temporary dressing and rebook her for a longer appointment.",
    "This respects her wish promptly and leaves the tooth safe, but it decides the outcome for her without asking what the problem is, when a short break or an adjusted dam might have let her continue. That one step puts it just below exploring first."
   ],
   [
    "Stop, remove the rubber dam and ask your nurse to sit with her while you fetch your supervisor to talk through her options.",
    "Stopping is right, but explaining her options is within your competence, and fetching your supervisor keeps her waiting in the chair with the tooth open when she wants to leave. It ranks below dressing and rebooking, which respects her wish more promptly."
   ],
   [
    "Pause with the dam in place and ask whether she could manage five more minutes, so that the tooth can be sealed properly before she goes.",
    "Asking still seeks her agreement, which keeps it above carrying on, but it keeps her under the dam she wants removed and puts the clinical goal before her stated wish (Std 3.3.1). It risks her agreeing under pressure."
   ],
   [
    "Tell her you’ll stop as soon as you’ve finished the canal you’re working in, and talk her through each step until then.",
    "Talking her through sounds reassuring, but she has withdrawn consent and this carries on treating regardless, however briefly (Std 3.1.5). Treatment without valid consent puts it at the bottom."
   ]
  ],
  "tk": "Consent can be withdrawn at any point in treatment: stop, make the patient comfortable, find out what is wrong and let her choose from the options.",
  "r": [
   "3.1.5",
   "3.3.1",
   "1.2.4"
  ]
 },
 {
  "t": "consider",
  "d": "P",
  "g": "K",
  "a": "Alcohol before an extraction",
  "k": "ABCDE",
  "s": "Nine months into DFT, Mr Dunn arrives at 2pm for extraction of a lower right second molar that has been painful for two weeks. He is very anxious and tells you he ‘had three pints at lunch to steady my nerves’. He is coherent, answers your questions sensibly and is keen to go ahead. He came by bus, has taken the afternoon off work and says it is hard to get more time off. Your next free extraction slot is in three days.",
  "o": [
   [
    "Whether the alcohol affects his ability to give valid consent today, and whether it makes the extraction unsafe.",
    "This decides whether treatment can lawfully and safely go ahead at all: capacity is time-specific and alcohol can impair it, and it adds clinical risk (Std 3.2.4). Every other consideration depends on the answer, so it comes first."
   ],
   [
    "The harm to him from waiting, including his pain and the risk of infection, if it isn’t extracted today.",
    "This is about his health rather than his preference: whatever you decide, his pain needs managing and the delay must be safe. It sits just above his wish to proceed because harm from delay is a safety question (Std 1.4.2)."
   ],
   [
    "His clear wish to have the tooth taken out this afternoon rather than having to come back on another day.",
    "His wish carries real weight, and an unwise choice alone doesn’t show a lack of capacity. But it can only be acted on if his consent is valid, and it matters less than the harm a delay could do him."
   ],
   [
    "Whether there is someone who can collect him and keep an eye on him this evening after an extraction.",
    "Aftercare matters more after drinking, but it only arises if treatment goes ahead and it is a practical arrangement that can usually be solved. That places it below the questions about his consent, health and wishes."
   ],
   [
    "The afternoon he has taken off work, and the clinical time the practice has already set aside for him.",
    "Lost time is a real cost to him and to the practice, but it is convenience, not safety or consent. It is the least important consideration and should not tip the decision."
   ]
  ],
  "tk": "Before acting on a patient’s wish to proceed, establish that consent is valid and treatment safe at that moment; then weigh the harm of delay, their wishes and practicalities, with convenience last.",
  "r": [
   "3.2.4",
   "3.1",
   "1.4.2"
  ]
 },
 {
  "t": "rank",
  "d": "T",
  "g": "F",
  "a": "Receptionist opens ex-partner’s record",
  "k": "ABCDE",
  "s": "Five months into DFT, you walk behind reception and see Jade, a receptionist, viewing the record of a patient who you know, from staff-room conversation, is now the partner of Jade’s former partner. The patient has no appointment booked, and you don’t know whether she has contacted the practice recently. Jade closes the record quickly when she sees you. The practice manager, who is the practice’s information-governance lead, is in the building today.",
  "o": [
   [
    "Speak to Jade privately this morning, say what you saw and ask whether she was dealing with something for that patient.",
    "You don’t know whether she had a work reason, so asking her first is fair and proportionate, and it gives her the chance to explain or put it right (Std 4.2.2). It beats going straight to the manager because you might be wrong."
   ],
   [
    "Tell the practice manager what you saw, as the information-governance lead, and leave her to decide how to look into it.",
    "She is the right person if there is a concern, so this is a strong option, but it skips asking Jade when she may have a simple explanation. Going over a colleague’s head first is the one step that puts it second."
   ],
   [
    "Ask the practice manager to remind all staff at the next team meeting that records may be opened only for work reasons.",
    "A general reminder supports good practice and avoids accusing anyone, but it leaves a possible breach about one patient unexplored. It is a partial measure, though better than only watching."
   ],
   [
    "Make a note of the date, time and patient, and watch for any further signs before deciding whether to raise it.",
    "Recording what you saw is reasonable, but waiting leaves a possible breach unchallenged when you could find out now (Std 8.2.1). Passive rather than harmful, it sits above investigating it yourself."
   ],
   [
    "Check the record’s access log yourself to see whether Jade has opened it before, so that any concern you raise is accurate.",
    "Wanting accuracy sounds responsible, but you would be investigating a colleague and looking into a patient’s record with no care reason of your own, which is a quiet confidentiality problem in itself (Std 4.2.1). That puts it at the bottom."
   ]
  ],
  "tk": "When you see a possible confidentiality breach but don’t know the reason, ask the colleague privately first, then involve the information-governance lead if there is no work reason; don’t investigate it yourself.",
  "r": [
   "4.2.2",
   "4.2.1",
   "8.2.1"
  ]
 },
 {
  "t": "best3",
  "d": "I",
  "g": "F",
  "a": "Practice custom on records access",
  "k": "ABC",
  "s": "Seven months into DFT, you are finishing a filling for Mrs Ana Ferreira, 52. She tells you she is moving to Portugal in six weeks and asks for a copy of her dental records, including her radiographs, to take to a new dentist. When you mention it to the practice manager at the surgery door, she says the practice charges £50 for copies and that they take ‘up to three months’. The practice manager is in her office all afternoon. Mrs Ferreira’s appointment ends in ten minutes, and your next patient is waiting.",
  "o": [
   [
    "Tell Mrs Ferreira that she has a right to a copy, which is usually free and due within one month of her asking.",
    "She asked you directly, and the law, not practice custom, sets her right of access: usually free and within a month (Std 4.4.1). Telling her this yourself, now, beats promising to find out what she will pay, because the answer is already settled and she has little time before she moves."
   ],
   [
    "Speak to the practice manager privately this afternoon, explaining that copies are usually free and due within a month.",
    "The £50 fee and three-month wait are the system problem, and the practice manager is the right person and available today (Std 4.4.1, 1.9.1). Raising it yourself, privately and now, beats asking your supervisor to do it for you, which moves a conversation that is yours to have."
   ],
   [
    "Make sure her request is entered in the practice’s records-request log today, with the date on which she asked.",
    "A verbal request is valid and the one-month limit runs from when she asked, so logging it now protects her timescale and gives the practice an audit trail (Std 4.4.1, 4.1). It beats asking her to write in, which adds a hurdle the law doesn’t require and starts the clock later."
   ],
   [
    "Ask her to put the request in writing to the practice manager, so that there is a clear record of exactly what she wants.",
    "A written request is tidy and well meant, but she has already made a valid request in person, so this adds a step and delays the start of the time limit (Std 4.4.1). Logging her spoken request today does the same job without the hurdle."
   ],
   [
    "Tell Mrs Ferreira you’ll find out from the practice manager what she will pay and how long it will take, and ring her later.",
    "Following up is helpful, but it treats the fee and wait as open questions when her right is already clear, and leaves her expecting to pay. It is a near-miss of telling her what she is actually entitled to."
   ],
   [
    "Ask your educational supervisor at lunch today to raise the fee and the timescale with the practice manager for you.",
    "This is timely and your supervisor could help, but the practice manager is available this afternoon and the point is one you can make yourself, so it is the right concern routed through the wrong person. Speaking to her directly is more proportionate."
   ],
   [
    "Tell Mrs Ferreira that if the copy is slow or she is charged, she can complain to the Information Commissioner’s Office.",
    "The information is accurate, but it points her to the regulator before the practice has had a chance to put it right, and it leaves her to chase her own records. It ranks below acting locally to secure the copy and correct the policy."
   ],
   [
    "Export her records and radiographs from the system and email them to her yourself this evening, so she has them in time.",
    "This gets her the copy fast but bypasses the practice’s process and log, and sending full records and images outside a secure, approved route risks a confidentiality breach (Std 4.5.2). Starting the request properly today achieves the same outcome safely."
   ]
  ],
  "tk": "A patient’s right to a copy of her records is set by law, not practice custom: tell her what she is entitled to, start and date the request today, and raise the process with the practice manager yourself.",
  "r": [
   "4.4.1",
   "1.9.1",
   "4.5.2"
  ]
 },
 {
  "t": "rank",
  "d": "E",
  "g": "F",
  "a": "Patient asks to omit HIV status",
  "k": "ABCDE",
  "s": "Four months into DFT, you are taking a medical history from Mr Tomasz Nowak, 34, a new NHS patient attending for an examination only. He tells you he is HIV positive, takes daily antiretroviral tablets and has had an undetectable viral load for several years. He then asks you not to write it in his notes, because at his last practice he felt a receptionist treated him differently after seeing it on the screen. The practice uses electronic records, and you have twenty minutes left of his appointment. He seems anxious but willing to talk.",
  "o": [
   [
    "Ask about his experience at his last practice, explain why a complete history and restricted access protect him, then record it with him.",
    "The record must be complete (Std 4.1.1), and with twenty minutes and a patient willing to talk, hearing his experience before explaining and recording respects his fear and keeps his trust (Std 2.1, 4.2). It beats explaining and recording straight away because it engages with the worry he actually raised."
   ],
   [
    "Explain that his history must be complete to keep his care safe and that his records are confidential, and record his HIV status now.",
    "This secures an accurate record at once (Std 4.1.1) and gives him the reason and the reassurance, so it is only just behind the top option. It ranks lower because it answers his worry without first hearing it, when there was time to bring him with you."
   ],
   [
    "Ask what happened at his last practice, and agree to complete his history once the practice manager has confirmed who can see it.",
    "Exploring his worry is a strong, empathetic step, but the duty to keep a complete record is already settled, so making it wait for the practice manager leaves his history incomplete today (Std 4.1). It ranks below recording now but above any agreement to leave the diagnosis out."
   ],
   [
    "Record his antiretroviral medicines so that drug interactions can still be checked, but leave out the diagnosis itself as he asks.",
    "This sounds like a sensible compromise and protects prescribing safety, but the record is knowingly incomplete and misleading for other clinicians (Std 4.1, 4.1.4). It doesn’t even meet his aim, since the medicines reveal the diagnosis, yet it is safer than recording nothing."
   ],
   [
    "Agree to leave it out of his notes, since it is his own information and an undetectable viral load poses no risk to staff.",
    "Respecting his wishes sounds patient-centred, and his viral load is reassuring, but a complete medical history isn’t optional: leaving out a diagnosis and its medicines puts future care at risk and makes the record inaccurate (Std 4.1, 4.1.1). This is the least appropriate option."
   ]
  ],
  "tk": "A patient’s fear of stigma is a reason to hear it and explain how his records are protected, not to leave a diagnosis out: the medical history must be complete and accurate.",
  "r": [
   "4.1",
   "4.2",
   "2.1"
  ]
 },
 {
  "t": "rank",
  "d": "E",
  "g": "F",
  "a": "Patient messages personal Instagram",
  "k": "BDAEC",
  "s": "You are five months into DFT. At 8pm on Tuesday, at home, you receive a message on your personal Instagram account from Ms Petra Novak, whose lower left first molar you extracted yesterday. She has attached a photo of the socket and says it has become much more painful since this morning, smells unpleasant and isn’t helped by paracetamol. She mentions no swelling or difficulty swallowing, and has included her mobile number. The practice is closed until 8.30am, and its answerphone directs patients to NHS 111 out of hours. You are back at work at 8.15am tomorrow, and your next tutorial with your educational supervisor is on Thursday.",
  "o": [
   [
    "Reply with advice on painkillers and warm salt-water rinses, and ask her to phone the practice in the morning to book a review.",
    "This gives her a route to care and the advice is probably sound, but it is clinical advice based on a photo, given through a personal account and kept outside her record, so it blurs the boundary the two options above protect (Std 9.1.4, 4.5.2). It ranks above phoning her because it keeps the contact short and points her back to the practice."
   ],
   [
    "Reply briefly that you can’t advise through this account, direct her to NHS 111 tonight or the practice at 8.30am, and ask reception to fit her in.",
    "She is in pain tonight, so a short reply that gives her a proper route to care now, without any clinical advice through a personal account, protects both her and the professional boundary (Std 9.1.4, 2.3.9). It edges out the reception-only option because she isn’t left overnight without knowing where to turn."
   ],
   [
    "Leave it unanswered, since replying on a personal account blurs professional boundaries, and raise it with your supervisor on Thursday.",
    "Taking boundaries seriously and involving your supervisor sound responsible, but she has an unassessed, painful socket and no one will act on it for two days, so her care is sacrificed to your discomfort about the channel (Std 1.7.7). Every other option at least gets her help sooner."
   ],
   [
    "Leave the message unanswered and, when you arrive at 8.15am, ask reception to phone her and book her an urgent review that morning.",
    "Using the practice’s own channel to get her seen first thing keeps boundaries intact and secures care within hours, so it is a close second. It falls just short because she spends the night in pain with no idea whether anyone has seen her message or where she can get help now (Std 2.3.9)."
   ],
   [
    "Phone her tonight from your personal mobile on the number she included, to talk through her symptoms and advise her what to do.",
    "A conversation lets you check for warning signs, but it hands her your personal number, opens a private line of contact outside the practice and its records, and still books her nothing (Std 9.1.4, 4.1). It sits above leaving her until Thursday because she at least gets help tonight."
   ]
  ],
  "tk": "When a patient contacts you through a personal account, keep the reply brief and non-clinical, but never leave them without a route to care: point them to the right service now and make sure the practice follows up.",
  "r": [
   "9.1.4",
   "2.3.9",
   "4.5.2"
  ]
 },
 {
  "t": "rank",
  "d": "I",
  "g": "C",
  "a": "Etchant splashed near eye",
  "k": "DBECA",
  "s": "You are three months into DFT, placing a composite on an upper right lateral incisor for Mrs Grace Owusu, 41. Your nurse didn’t give her protective glasses at the start, and you didn’t notice. As you etch with phosphoric acid gel, the syringe tip comes off and a drop lands at the inner corner of her left eye. She says it stings and her eye is watering. There is an eyewash kit in the surgery, and your educational supervisor is working in the next surgery. The tooth is isolated, and no bonding agent has been applied yet.",
  "o": [
   [
    "Leave her with your nurse while you phone your indemnity provider for advice on what to say, as she may make a complaint.",
    "Getting advice first leaves acid near her eye with no first aid and holds back an honest explanation to protect yourself, when an apology is not an admission of liability (Std 1.3.1, 1.5). Putting your own position ahead of her eye and the truth makes it the least appropriate."
   ],
   [
    "Explain that etchant has splashed near her eye, apologise that she wasn’t given glasses, and arrange for her eye to be checked today.",
    "Telling her what happened, apologising for a lapse you share, and arranging an eye check meet the duty of candour, so this is a strong second. It loses to irrigation only on timing: with acid in the eye, first aid comes before the conversation (Std 1.3.1, 1.5)."
   ],
   [
    "Rinse around her eye with the three-in-one syringe, reassure her that the amount was very small, and finish etching and bonding the tooth.",
    "Getting water to the eye at once is why this sits above calling the indemnity provider first, but a brief rinse with the air-water syringe is not proper irrigation, the reassurance comes before her eye has been assessed, and carrying on puts the restoration ahead of a possible eye injury (Std 1.5, 1.3.1)."
   ],
   [
    "Stop, sit her upright and irrigate the eye with plenty of saline from the eyewash kit, holding the lids open, then check her vision.",
    "Acid in or near the eye is a first-aid emergency, and prompt, thorough irrigation does the most to limit damage, so it comes before explanations or paperwork (Std 1.5). It edges out the candour option only because those minutes matter more to her eye."
   ],
   [
    "Record exactly what happened in her notes, complete an incident report, and ask the practice manager to make glasses part of every set-up.",
    "Recording, reporting and fixing the missing-eyewear gap are all required (Std 1.5.4, 4.1), but they help future patients more than Mrs Owusu now, so they follow first aid and the honest conversation. They rank above the last two because they deal honestly with the cause rather than playing down the injury or protecting yourself."
   ]
  ],
  "tk": "When something goes wrong in the chair, deal with the harm first, then be open with the patient and apologise, and only then record, report and fix the system; never put your own protection ahead of her care.",
  "r": [
   "1.5",
   "1.3.1",
   "1.5.4"
  ]
 }
];

const RW_4_3 = [
 {
  "t": "best3",
  "d": "T",
  "g": "C",
  "a": "Nurse deletes unsaved radiographs",
  "k": "ACF",
  "s": "You are seven months into DFT. At 4pm you take two bitewings for Ms Leah Brennan, 29, glance at them on screen and see a possible lesion between her lower left premolars, meaning to report them properly after your next patient. She leaves with no further appointment booked. While clearing the screen, your nurse closes the record without saving, and the software confirms the images are gone. Visibly upset, she tells you she is already on a written warning about record-keeping and asks you not to tell the practice manager, who runs the practice’s incident-reporting process and is in until 6pm.",
  "o": [
   [
    "Phone Ms Brennan today to explain that her bitewings were lost, apologise, and offer a retake only if one is still clinically justified.",
    "She has been exposed to radiation for images that no longer exist, so she must be told promptly and offered an apology, and any further exposure needs its own justification (Std 1.3.1, 1.5.1). This covers the patient in the package."
   ],
   [
    "Retake the bitewings when she next attends, and explain to her then that the first images were lost before they were saved.",
    "It is honest in the end, but candour means telling her as soon as you realise, and with no appointment booked her possible lesion could wait months. It is a mistimed version of phoning her today."
   ],
   [
    "Tell the nurse you can’t keep it from the practice manager, and complete an incident report with her today, describing what happened.",
    "Loss of a patient’s images is an incident that must be recorded and reported, and loyalty to a colleague doesn’t override that (Std 1.5.4, 8.1.1). Doing it with her today is honest with her, keeps her involved rather than reported behind her back, and starts the practice’s learning. This covers the report in the package."
   ],
   [
    "Ask the practice’s IT support today whether the deleted files can be recovered, so that she may not need to be exposed again.",
    "Recovering the images would be the best outcome for her and is worth asking about, but it may well fail, and on its own it neither tells her nor reports the loss. It is a sensible extra rather than one of the three that solve the problem now."
   ],
   [
    "Support the nurse by treating it as a system gap, and suggest the imaging software is set to require saving before a record closes.",
    "A system fix is valuable learning and a supportive response encourages openness (Std 6.1.4, 8.3.1), but it is better taken forward through the incident report than as a separate suggestion today. It is secondary to telling the patient, reporting the loss and preserving the record."
   ],
   [
    "Write in her notes what you saw on screen before the images were lost, including the possible lesion, and that they weren’t saved.",
    "Her record must show that radiographs were taken, what you saw and why there are no images, so the possible lesion isn’t lost with them and any retake decision is informed (Std 4.1, 4.1.1). This preserves the clinical information in the package."
   ],
   [
    "Tell your educational supervisor in confidence and ask for advice, without involving the practice manager as the nurse asked.",
    "Your supervisor is a sensible person to consult, but keeping it from the person who runs incident reporting, because the nurse asked, still leaves the loss unreported (Std 1.5.4). It is the right action with the wrong person."
   ],
   [
    "Encourage the nurse to tell the practice manager herself tomorrow morning, and offer to go with her when she does.",
    "Letting a colleague report her own error is often good practice, but she has just asked you to keep it quiet, so leaving it with her overnight makes the report later and less certain. It is a near-miss of completing the report with her today."
   ]
  ],
  "tk": "When a colleague’s slip affects a patient, tell the patient promptly, record what you know so her care isn’t lost with the images, and report it through the proper process even when asked not to.",
  "r": [
   "1.5.4",
   "1.3.1",
   "4.1"
  ]
 },
 {
  "t": "rank",
  "d": "I",
  "g": "R",
  "a": "Supervisor’s plan seems excessive",
  "k": "BDECA",
  "s": "You are six months into DFT. Last month you examined Mrs Alison Reid, 52, and found sound teeth, a few small fillings and healthy gums. Since then she has seen your educational supervisor, Dr Simon Hale, privately, and he has given her a £6,000 plan for eight upper crowns ‘to rejuvenate the smile’, due to start in three weeks. Back with you today for a scale and polish, she shows you the plan and asks whether she really needs it. You saw no clinical reason for crowns, but you haven’t seen Dr Hale’s notes, radiographs or findings, or what he discussed with her. He is in the practice all week, and he has always been open to discussing cases with you.",
  "o": [
   [
    "Tell her that your examination last month found no need for crowns, so she would be wise to cancel the plan before it starts.",
    "Your findings are genuine, but turning them into a verdict on a plan whose basis you haven’t seen could be wrong, could put her off care she needs, and undermines a colleague to his own patient (Std 9.1.2). It sits below going to the TPD because it acts on her treatment decision with incomplete information."
   ],
   [
    "Explain that you haven’t seen the findings behind the plan, and speak to your supervisor privately this week about his reasoning.",
    "You haven’t seen his findings, so you might be the one missing something; with three weeks before any treatment, asking him privately first is fair to both of them and lets her get a properly informed answer (Std 9.1.2, 8.2.1). It edges out encouraging her own questions because the clinical doubt is yours, so you should be the one to resolve it."
   ],
   [
    "Raise your concern about the plan with your TPD this week, before speaking to your supervisor, as it is his planning you question.",
    "Escalating sounds conscientious, but he has always been open to discussion, so going over his head skips the person concerned before you know there is a problem at all, and it does nothing for her question (Std 8.2.3). It ranks above telling her to cancel only because it doesn’t steer her treatment on incomplete information."
   ],
   [
    "Encourage her to ask your supervisor about the alternatives, including fewer or no crowns, and tell her she can seek a second opinion.",
    "Pointing her to the alternatives and her right to a second opinion respects her autonomy and keeps the decision hers (Std 2.2.1, 3.1.3). It falls just short of the private conversation because it hands your unresolved doubt to the patient instead of settling it with the colleague who made the plan."
   ],
   [
    "Tell her it wouldn’t be right to comment on another dentist’s plan, and suggest she takes her questions back to your supervisor.",
    "Declining to criticise a colleague avoids undermining him without the facts, but it deflects a fair question and leaves her unsure of her choices (Std 2.2.3). It is a passive version of encouraging her to ask about alternatives, yet still sits above the two options that act before the facts are known."
   ]
  ],
  "tk": "When a colleague’s plan looks excessive but you haven’t seen their findings, find out from them privately before answering the patient, while making sure she knows the choice remains hers.",
  "r": [
   "9.1.2",
   "8.2.1",
   "2.2.1"
  ]
 },
 {
  "t": "best3",
  "d": "T",
  "g": "R",
  "a": "Hygienist working while unregistered",
  "k": "BDG",
  "s": "You are eight months into DFT. At lunch the practice hygienist, Carla Mendes, mentions that she forgot to pay her annual GDC fee and has had a letter confirming she was removed from the register two weeks ago. She laughs it off, saying she’ll pay and sort it out next month after payday. She has a full list of patients from 2pm. The practice owner is on holiday this week, the practice manager is in the building until 5pm, and your educational supervisor is in clinic all afternoon, with your next tutorial on Friday. It is 1.15pm.",
  "o": [
   [
    "Offer to lend her the fee so that she can pay it online over lunch and see her patients this afternoon as planned.",
    "This is generous, but paying online over lunch wouldn’t put her back on the register before 2pm, so she would still be working unregistered this afternoon. It is well-meant help that leaves the immediate problem in place."
   ],
   [
    "Tell her plainly that she can’t see patients while off the register, so this afternoon’s list can’t go ahead as booked.",
    "Working as a hygienist while off the register is unlawful and leaves her patients without the protection registration gives, so she must hear clearly that today’s list can’t go ahead (Std 1.9, 8.1.1). This covers the immediate risk in the package."
   ],
   [
    "Check the online register yourself before saying anything, in case her registration is in fact still showing as current.",
    "A quick check isn’t unreasonable, but she has told you she holds a letter confirming removal, so it delays acting without adding anything that changes what must happen. It is a mistimed version of acting on what you already know."
   ],
   [
    "Make sure the practice manager knows before 2pm, giving her the chance to tell them first, so her patients can be rebooked.",
    "Her patients must be rebooked or reallocated within the next 45 minutes, which only the practice can arrange, and loyalty doesn’t override that duty (Std 8.1.1, 8.2.3). Letting her tell the manager first is fair to her, but the manager must know before 2pm either way; this covers the practice’s response in the package."
   ],
   [
    "Report it to the GDC yourself today, since working as a hygienist while unregistered is a criminal offence.",
    "The offence is real, but the practice can stop it this afternoon and she can put her registration right herself, so going straight to the regulator is a premature escalation (Std 8.2.5). It would become appropriate only if local action failed or she kept working."
   ],
   [
    "Encourage her to tell the practice manager herself by the end of the week, once she has worked out how to pay.",
    "Letting a colleague raise it herself is often the right approach, but by the end of the week she will have seen a full afternoon of patients while unregistered. It is a mistimed version of making sure the manager knows before 2pm."
   ],
   [
    "Encourage her to contact the GDC this afternoon to apply for restoration and find out how long it is likely to take.",
    "Restoring registration is a formal process rather than a payment alone, so contacting the GDC today is her quickest route back to work and treats her as a colleague to be helped, not just a problem to be managed (Std 1.9). This covers the person in the package."
   ],
   [
    "Ask your educational supervisor for advice at your tutorial on Friday before you decide whether to tell anyone.",
    "Your supervisor is a sensible source of advice, but Friday is far too late when her list starts in 45 minutes, and you already know enough to act. It is the right person at the wrong time."
   ]
  ],
  "tk": "When a colleague is practising while unregistered, loyalty doesn’t override the law: stop today’s work, make sure the practice can protect her patients, and help her put her registration right.",
  "r": [
   "8.1.1",
   "1.9",
   "8.2.3"
  ]
 },
 {
  "t": "rank",
  "d": "P",
  "g": "R",
  "a": "Wrong-side anaesthetic under way",
  "k": "CEADB",
  "s": "You are four months into DFT. Between your own patients, an associate, Dr Marek Nowak, calls you into his surgery and asks you to glance at a periapical radiograph on his screen while he gives an inferior dental block. Mrs Joyce Bello, 47, has been referred by another practice for extraction of a lower first molar, and the referral letter says lower left. The radiograph, taken here last week and labelled with her name, shows a grossly carious lower right first molar; the lower left one looks sound. Dr Nowak is part-way through the injection on the left side, and your own next patient is due in five minutes.",
  "o": [
   [
    "Check the referral letter and the clinical notes yourself while he finishes, then tell him what you find before he extracts.",
    "Checking the paperwork is sensible, but doing it alone while he carries on keeps the one person who can stop the treatment unaware, and you may not finish before he starts. It is the right check with the wrong person, which is why it sits below checking together."
   ],
   [
    "Wait until the patient has left, then tell him privately that the radiograph seemed to show the other side, to avoid alarming her.",
    "Wanting to spare her alarm is considerate, but it puts her comfort in the moment ahead of the risk of losing a sound tooth, which can’t be undone (Std 8.1.1). Every other option raises the doubt while it can still change what happens to her."
   ],
   [
    "Tell him straight away, before he gives any more anaesthetic, that the radiograph seems to show the decay on the lower right.",
    "Speaking up at once, framed as what the radiograph seems to show rather than as an accusation, gives him the chance to stop before any further unneeded treatment (Std 8.1.1, 8.2.1). It edges out checking together afterwards because the injection itself is treatment she may not need."
   ],
   [
    "Ask the nurse to fetch your educational supervisor to look at the radiograph before the associate begins the extraction.",
    "A senior opinion sounds safe, but going over his head delays telling the operator himself, and your supervisor may not arrive before he starts (Std 8.2.3). It ranks above waiting because it still aims to stop a wrong extraction."
   ],
   [
    "Wait until he has finished the injection, then ask him to check the radiograph, notes and referral with you before he extracts.",
    "Checking everything together before any extraction would almost certainly prevent a wrong-site extraction, and allows for the chance that you have misread the image, so it is a close second (Std 6.5). It loses only on timing: waiting lets him finish an injection on a side that may not need treatment."
   ]
  ],
  "tk": "If you see something that may lead to wrong-site treatment, say so straight away to the person treating, framed as what you see, rather than checking quietly or waiting until later.",
  "r": [
   "8.1.1",
   "8.2.1",
   "6.5"
  ]
 },
 {
  "t": "rank",
  "d": "E",
  "g": "M",
  "a": "New crown looks too grey",
  "k": "CAEBD",
  "s": "You are nine months into DFT. Three days ago you permanently cemented a lab-made crown on the upper right central incisor of Ms Hannah Clarke, 31, after your supervisor checked it with you. You had taken the shade under the surgery light at the preparation visit. She arrives unbooked at lunchtime, upset, saying that in photos from the weekend the crown looks noticeably greyer than her other teeth. Her wedding is in three weeks. You haven’t yet looked at the crown today. Your educational supervisor is in the practice this afternoon, the lab usually needs ten working days for a remake, and your next patient is in 20 minutes.",
  "o": [
   [
    "Apologise that she is unhappy with how it looks, and arrange for the lab technician to check the shade with her in daylight this week.",
    "Apologising for her disappointment is right, and a technician’s daylight shade check gets an objective answer before any remedy is promised, which puts this close behind the top option. It falls short because she is in front of you now, so handing the first look to someone else days later moves the problem rather than owning it."
   ],
   [
    "Reassure her that there is still time before the wedding, and arrange for the crown to be remade at no charge to her.",
    "Offering a remake is generous, but promising it free and in time, before you have assessed the crown, agreed it with your supervisor or allowed for the lab’s ten-day turnaround, risks a second disappointment just before her wedding (Std 5.3.9). It sits below discussing a remake with your supervisor because it promises an outcome that isn’t yours alone to deliver."
   ],
   [
    "Ask her what she has noticed, then look at the crown with her in daylight beside her other teeth before discussing options.",
    "She is in front of you with 20 minutes to spare, so hearing exactly what bothers her and seeing the crown in natural light beside her own teeth is the step every later decision depends on (Std 5.2.1, 1.1.1). It edges out a technician’s shade check because she is here now and the first look is yours to take."
   ],
   [
    "Show her the shade recorded at the preparation visit, and explain that photos and indoor lighting often make crowns look greyer.",
    "Lighting and photos can genuinely distort shade, but leading with the record and an explanation defends the work before you have listened or looked, which is the defensiveness complaint guidance warns against (Std 5.2.1). Every other option at least treats her concern as something to be put right."
   ],
   [
    "Tell her you will discuss a remake with your supervisor and the lab this week, and book her in to go through the options with you.",
    "Taking it to your supervisor and the lab and booking time to go through the options owns the problem and respects her deadline (Std 5.3.8). It sits below getting the shade checked because it starts planning a remake before anyone has confirmed the shade is wrong or understood what she sees."
   ]
  ],
  "tk": "When a patient is unhappy with the result, listen and look at the problem with them before offering a remedy, and never lead with a defence of the work.",
  "r": [
   "5.2.1",
   "1.1.1",
   "5.3.8"
  ]
 },
 {
  "t": "best3",
  "d": "E",
  "g": "M",
  "a": "Deaf patient, no interpreter",
  "k": "BEG",
  "s": "You are four months into DFT. Ms Joanne Pryce, 46, is Deaf and uses British Sign Language. She has a 30-minute appointment to decide between root canal treatment and extraction of her lower left first molar, which ached last month but is comfortable today, with no swelling. No interpreter was booked, and her record says nothing about her communication needs. Her 14-year-old daughter, who has come with her, offers to interpret, and Ms Pryce signs that she is happy with this. She lip-reads a little, and her written English is limited. One receptionist has a basic BSL certificate. Reception can book a qualified interpreter for an appointment in eight days.",
  "o": [
   [
    "Accept the daughter’s offer as Ms Pryce is happy with it, and check the main points back with her in writing at the end.",
    "Ms Pryce’s agreement makes this tempting, but a 14-year-old can’t be relied on to convey risks and options accurately for an irreversible choice, and it puts a child in an adult’s role (Std 2.3.3). With no pain today there is no urgency to justify it, so rebooking with an interpreter is better."
   ],
   [
    "Explain in simple writing and gesture that you want a qualified interpreter for this decision, and rebook with one.",
    "This deals with the immediate problem: the tooth is comfortable, so waiting eight days costs little, while a qualified interpreter is what makes her consent informed (Std 2.3.3, 3.2.2). It beats every way of pressing on today, because each of those leaves her understanding in doubt."
   ],
   [
    "Hold the options discussion today by passing written notes back and forth, so she can ask questions at her own pace.",
    "Writing avoids using her daughter, but the stem says her written English is limited, and BSL is a language in its own right, so notes risk a decision she hasn’t fully understood (Std 3.2.2). It is a partial measure next to rebooking with an interpreter."
   ],
   [
    "Ask the receptionist with the basic BSL certificate to join you, so that Ms Pryce can talk to you in her own language.",
    "This is well meant and closer to her language than writing, but basic BSL isn’t interpreting, and the receptionist would learn her clinical details without being needed for her care (Std 2.3.3, 4.2.1). A qualified interpreter in eight days is the safer route."
   ],
   [
    "Record in her notes that she uses BSL and needs an interpreter, so one is booked automatically for every future visit.",
    "This is the system fix: the problem happened because her needs weren’t recorded, and flagging them prevents a repeat at every visit, which is a reasonable adjustment (Std 1.6.3, 2.1.1). It completes the package alongside rebooking and making sure she isn’t left without contact."
   ],
   [
    "Give her the practice’s text and email contacts in writing, and show her in writing what to do if the tooth flares up.",
    "A text or email route matters because voice phone lines may not work for her, so this keeps her safe while she waits (Std 2.3.9). It falls just short of the keyed version because it says nothing about the practice having let her down, so it is the safety-net without the candour."
   ],
   [
    "Apologise that no interpreter was booked, and make sure she can reach the practice by text or email if the tooth flares up.",
    "The practice let her down, so an apology is right, and because voice phone lines may not work for her, a text or email route keeps her safe while she waits (Std 2.3.10, 2.3.9). This covers the person while the other two keyed options cover today’s decision and the system."
   ],
   [
    "Offer to refer her to a nearby practice that has a dentist who signs, so she can discuss the options in BSL there.",
    "Signing directly sounds ideal, but it moves the problem instead of making the reasonable adjustment the practice owes her, and it disrupts her continuity of care (Std 1.6.3). It only makes sense if she would genuinely prefer it."
   ]
  ],
  "tk": "When a patient needs an interpreter for a non-urgent decision, rebook with a qualified one rather than use a child or a makeshift route, apologise, keep a contact route open and record the need so it never happens again.",
  "r": [
   "2.3.3",
   "1.6.3",
   "3.2.2"
  ]
 },
 {
  "t": "rank",
  "d": "P",
  "g": "M",
  "a": "Patient demands antibiotics",
  "k": "DBECA",
  "s": "You are seven months into DFT. Ms Carla Mendes, 38, has a 30-minute emergency slot with you at 11am for a lower right first molar that has kept her awake for three nights. You find deep caries and lingering pain to heat, with no swelling, a normal temperature and no periapical change on the radiograph, and you diagnose irreversible pulpitis. Your nurse is free, and the slot allows time to remove the pulp. Ms Mendes asks for antibiotics, saying her last dentist always gave them and they worked. She works shifts in a care home and says she can’t take time off for a course of treatment. She is in the chair now.",
  "o": [
   [
    "Prescribe a three-day course of amoxicillin to tide her over, and book the pulp removal for a slot that fits her shifts.",
    "Booking the treatment makes this sound like a plan, but antibiotics don’t relieve pulpitis, so she bears the side effects and resistance risk for no benefit while still waiting for the treatment that works (Std 7.1.1, 1.4.2). Every other option at least avoids an unnecessary prescription."
   ],
   [
    "Explain why antibiotics won’t ease this pain, give pain-relief advice and book the pulp removal this week at a time that fits her shifts.",
    "The explanation is right and fitting the visit round her shifts respects her working life, which puts this close behind treating today, but she has been awake for three nights and the time is already booked, so waiting delays relief she could have now (Std 1.2.4). It beats leaving the next step to her because a date is fixed."
   ],
   [
    "Tell her you’ll ask your ES whether a prescription is appropriate, and phone her this afternoon with the decision.",
    "Involving your ES sounds prudent, but the diagnosis is settled and the answer is within your competence, so this defers a question you can answer and implies antibiotics might be an option (Std 7.1.1). It ranks above prescribing because no antibiotic is given yet."
   ],
   [
    "Explain why antibiotics won’t ease this kind of pain, and offer to remove the inflamed pulp now, with pain-relief advice.",
    "This answers her request honestly and treats the cause in the time already booked, which suits her as she can’t easily take time off (Std 1.4.2, 7.1.1). It edges out booking the treatment later this week only because she can be helped today."
   ],
   [
    "Explain why antibiotics won’t help and give pain-relief advice, asking her to phone when she can arrange time off for treatment.",
    "The advice is correct and you own the conversation, but leaving the next step to her risks weeks of pain with no plan, so it falls below booking a definite slot (Std 1.2.4). It still ranks above handing a settled question to your ES."
   ]
  ],
  "tk": "Antibiotics don’t treat inflammatory pulpal pain: explain why, and offer the treatment that works at the earliest point the patient can have it, which is often now.",
  "r": [
   "1.4.2",
   "7.1.1",
   "1.2.4"
  ]
 },
 {
  "t": "rank",
  "d": "P",
  "g": "P",
  "a": "Absent colleague’s urgent histology",
  "k": "CEDAB",
  "s": "You are three months into DFT. A histology report arrives for Mr Alan Brierley, 58, a patient of Mr Okafor, an associate who started three weeks’ annual leave today. The tongue biopsy shows moderate dysplasia, and the pathologist recommends referral to the hospital oral medicine team within two weeks. Mr Okafor’s notes record the biopsy but no follow-up plan, and no one has contacted the patient. You have never met Mr Brierley. Your ES, who is also the practice principal, is in clinic all day and free at lunchtime. The practice manager is at the front desk.",
  "o": [
   [
    "Email the report to Mr Okafor’s work account, marked urgent, so he can decide how he wants his patient’s care handled.",
    "Respecting his ownership sounds right, but he is on leave and may not read it for weeks, so the two-week deadline depends on someone who isn’t available (Std 8.1). It ranks above leaving it in his tray only because he might reply and delegate."
   ],
   [
    "Flag the report as urgent and put it in Mr Okafor’s tray, since he knows the patient and the clinical background best.",
    "Continuity of care sounds responsible, but he is away for three weeks, so the flag guarantees the two-week window is missed for a potentially precancerous lesion (Std 8.1, 1.7.7). Every other option at least gives the patient a chance of timely action."
   ],
   [
    "Show the report to your ES at lunchtime today, so a dentist takes over Mr Brierley’s care and the referral is made in time.",
    "This acts within hours and puts the patient with a senior clinician who can take responsibility for contacting him, explaining the result and referring (Std 6.5, 8.1). It edges out referring him yourself because you have never met him and the principal decides who covers an absent colleague’s patients."
   ],
   [
    "Ask the practice manager to book Mr Brierley in with whichever dentist has the first free appointment this week.",
    "This gets him seen within days, but it leaves a non-clinician to judge urgency and allocate care, and the dentist who sees him may not have the report in mind (Std 6.5). It is better than relying on someone on leave."
   ],
   [
    "Make the hospital referral yourself today from the report and the notes, and tell your ES at lunchtime what you have done.",
    "This meets the deadline and keeps your ES informed, so it is a close second, but you are acting alone on another dentist’s patient you have never met, and no one has yet agreed who will explain the result to him (Std 6.5, 1.7.7). It beats booking him with any free dentist because the referral is secured today."
   ]
  ],
  "tk": "A time-critical result can’t wait for an absent clinician: take it the same day to the senior dentist who can assign responsibility, so the patient is contacted and referred within the timescale.",
  "r": [
   "8.1",
   "6.5",
   "1.7.7"
  ]
 }
];

const RW_4_4 = [
 {
  "t": "best3",
  "d": "I",
  "g": "H",
  "a": "Open lesion on your finger",
  "k": "BDF",
  "s": "You are six months into DFT. After months of frequent gloving and handwashing, the skin on your hands has become dry and cracked, and this morning a crack on your right index finger is open and weeping. It is 8.30am. Your first patient is at 9am, and three extractions are booked later in the morning. The first aid kit has waterproof dressings. Your ES is in the next surgery, and the practice manager arrives at 8.45am. You haven’t sought advice about your hands before.",
  "o": [
   [
    "Wear two pairs of gloves for the extractions, so the open crack has an extra barrier against blood and saliva.",
    "Double-gloving adds some protection, but gloves can tear and an uncovered weeping lesion still risks exposure in both directions, so it falls short of a sealed waterproof dressing (Std 1.5.2). It is a partial measure, not the fix."
   ],
   [
    "Cover the crack with a waterproof dressing under your gloves, and don’t extract unless it stays fully sealed.",
    "This deals with the immediate risk: a sealed dressing is what lets you work safely, and holding back from the extractions if it won’t stay sealed protects you and the patients (Std 1.5.2, 6.2.1). It is more reliable than gloves alone."
   ],
   [
    "Cancel your clinical list for the day and go home, so the crack can heal before you treat anyone again.",
    "Putting safety first is understandable, but a coverable lesion doesn’t need a whole day’s patients to lose their care, and going home doesn’t address the cause (Std 1.5.2). It overreacts compared with dressing it and adjusting the list if needed."
   ],
   [
    "See occupational health or your GP about the cracking, in case it is dermatitis or a reaction to your gloves.",
    "Months of cracking suggest a condition that needs proper assessment, and the standards say not to rely on your own judgement of a health risk to patients (Std 9.2.2, 9.2.1). This covers your health and stops it recurring, which none of the self-help options does."
   ],
   [
    "Buy a steroid cream at lunchtime and apply it after each glove change to settle the inflammation.",
    "It is proactive, but self-treating without a diagnosis may miss an allergy, and carrying on without advice is relying on your own judgement of the risk (Std 9.2.2). Occupational health or your GP is the better route."
   ],
   [
    "Tell your ES or the practice manager, so your list can be adjusted if the crack can’t be kept covered.",
    "Being open lets the team move the extractions or support you without disrupting patients unnecessarily, and it means the people responsible for safe working know (Std 9.2.1, 6.2.1). It covers the whole list, which is why it beats moving only the extractions."
   ],
   [
    "Ask your ES whether the associate could take your three extractions today, and keep the rest of your list as booked.",
    "Moving the highest-risk procedures through your ES is open and sensible, but it treats the extractions as the only exposure, when the open crack matters for every patient this morning unless it stays sealed (Std 1.5.2, 9.2.1). It is a narrower version of telling your ES or manager so the list can be adjusted."
   ],
   [
    "Switch to the nitrile gloves in the stock cupboard, and use alcohol rub instead of soap between patients.",
    "This may reduce irritation over time and is a reasonable step, but it guesses at the cause and does nothing for the open lesion this morning (Std 1.5.2). It is less important than covering the crack, getting assessed and telling your team."
   ]
  ],
  "tk": "An open lesion on your hand is an infection-control and fitness-to-work issue: cover it or don’t operate, get it assessed rather than self-treating, and be open with your team so patients’ care can be adjusted.",
  "r": [
   "1.5.2",
   "9.2.2",
   "9.2.1"
  ]
 },
 {
  "t": "rank",
  "d": "T",
  "g": "T",
  "a": "Nurse repeatedly leaving the surgery",
  "k": "DBECA",
  "s": "You are four months into DFT. Lena, the nurse who has worked with you since September and was previously very reliable, has for the past two weeks often left the surgery during treatment to chat at reception or check her phone in the corridor. Yesterday she walked out while you were giving an inferior alveolar nerve block, leaving you alone with the patient. Nobody has mentioned any of this to her yet. She is working with you all day today. The practice manager, who manages the nursing team, is in the building, and your ES is in clinic next door.",
  "o": [
   [
    "Ask the practice manager to remind all the nurses at Friday’s team meeting to stay chairside throughout treatment, without naming anyone.",
    "A general reminder avoids an awkward conversation, but it may not reach Lena because she isn’t named, nothing changes until Friday, and you would be left alone with patients in the meantime (Std 6.2.6). Doing least about a live risk puts it at the bottom."
   ],
   [
    "Tell the practice manager before the afternoon list what has been happening, including yesterday’s nerve block, so that she can take it up with Lena.",
    "This takes a genuine safety risk to the person who manages nurses on the same day, so it sits close behind the top option. It falls short because it goes over Lena’s head before anyone has given her the chance to explain or put it right, when she is with you all day (Std 8.2.3, 6.1.1)."
   ],
   [
    "Ask the practice manager to pair you with a different nurse for the time being, so that you are never left alone with a patient again.",
    "This protects your own patients, which makes it sound responsible, but it moves the problem to colleagues and their patients and leaves Lena unaware that anything is wrong (Std 6.1.1, 8.1.1). It still keeps you chairside-safe from today, which is why it sits above an anonymous reminder."
   ],
   [
    "Find a private moment with Lena before the afternoon list, explain why you need her chairside throughout, and ask whether anything is wrong.",
    "No one has told her, and a sudden change in a reliable nurse may have a cause, so a private conversation that explains the reason gives her the chance to put it right and removes the risk from this afternoon (Std 6.2.6, 6.1.1). It edges out going to the manager only because she hasn’t yet had that chance."
   ],
   [
    "Ask your ES between patients how you should approach the problem, and hold off saying anything to Lena until you have had their advice.",
    "Advice from your ES is sensible, but this is a conversation you are able to have yourself, and holding back leaves the risk in place in the meantime (Std 6.2.6). It ranks above the team reminder because it keeps the focus on Lena rather than diluting it."
   ]
  ],
  "tk": "When a colleague’s behaviour puts patients at risk and nobody has raised it with them, speak to them privately first, explain why it matters and ask what is going on, before taking it to their manager.",
  "r": [
   "6.2.6",
   "6.1.1",
   "8.2.3"
  ]
 },
 {
  "t": "best3",
  "d": "T",
  "g": "T",
  "a": "Nurses in conflict, handovers missed",
  "k": "BEG",
  "s": "You are seven months into DFT. Priya and Holly, the two nurses who alternate sessions in your surgery, have stopped speaking to each other. Twice this week you have started a session to find the endodontic kit not restocked and an autoclaved tray not logged, because neither left a handover. At lunch, Priya tells you that Holly is ‘useless’ and asks you to back the complaint she plans to make to the practice manager. You have heard nothing from Holly. The practice manager is in today, and you have a full afternoon list.",
  "o": [
   [
    "Add your name to Priya’s complaint, since the missed handovers in your surgery do support what she is saying about Holly.",
    "Her concerns may have substance, but joining her complaint makes you a party to a dispute you have heard only one side of. The patient-care facts belong with the manager in neutral terms, as in the keyed option (Std 6.1.2)."
   ],
   [
    "Tell Priya you won’t take sides, and encourage her to raise her concerns about working with Holly with the practice manager herself.",
    "Staying neutral while pointing her to the person who manages staff disputes respects both nurses and keeps you out of a grievance that isn’t yours to settle (Std 6.1.2, 6.1.4)."
   ],
   [
    "Arrange a meeting with Priya and Holly after work to help them talk through their differences and agree how to hand over.",
    "Well meant, but mediating a staff conflict is the practice manager’s role rather than a trainee’s, and it risks inflaming things without fixing this afternoon’s gaps (Std 6.1.1)."
   ],
   [
    "Ask your ES between patients today how best to handle being caught between the two nurses and the missed handovers.",
    "Asking today keeps the advice timely and is a reasonable source of support, but it outsources a situation you can handle yourself, and on its own it neither fixes this afternoon’s gaps nor tells the manager (Std 6.1.1)."
   ],
   [
    "Agree a short start-of-session checklist for instruments and stock in your surgery, used by whichever nurse is working, from this afternoon.",
    "A checklist that doesn’t depend on the two nurses talking makes your surgery safe from today, which is the immediate patient-safety step (Std 6.1.1, 1.5)."
   ],
   [
    "Speak to Holly privately, tell her what Priya has said about her, and ask for her side so that you understand the problem.",
    "Hearing her side sounds fair, but repeating Priya’s remark breaks a confidence and is likely to deepen the rift, and it draws you further into a dispute you should stay out of (Std 6.1.2)."
   ],
   [
    "Let the practice manager know today that missed handovers of instruments and stock are affecting patient care, sticking to the facts.",
    "The missed handovers are a patient-safety matter in their own right, so giving the manager the facts today, separately from Priya’s complaint, lets the person responsible act (Std 8.2.3, 6.1.1)."
   ],
   [
    "Ask the practice manager to roster only one of the two nurses in your surgery until the situation between them has settled down.",
    "This would remove the handovers from your surgery, but it moves the problem rather than solving it and leaves the conflict, and the rota, to others (Std 6.1.1)."
   ]
  ],
  "tk": "Caught in a dispute between colleagues, stay neutral and point them to the proper route, report the patient-care facts to the manager yourself, and make your own surgery safe in the meantime.",
  "r": [
   "6.1.1",
   "6.1.2",
   "8.2.3"
  ]
 },
 {
  "t": "rank",
  "d": "I",
  "g": "I",
  "a": "Unearned CPD certificate",
  "k": "DBAEC",
  "s": "You are nine months into DFT, and your e-portfolio review with your TPD is in ten days. You are two hours short of the verifiable CPD your scheme expects, and you have not yet done a medical emergencies update. Last night you started a two-hour online course on medical emergencies, but your connection dropped after about an hour. When you logged back in, the site had issued a certificate for the full two hours. The videos are still available to you. A colleague tells you that ‘everyone just clicks through’ these courses.",
  "o": [
   [
    "Email the course provider to say that the certificate was issued before you had finished, and ask how they would like you to proceed.",
    "This is honest and puts the provider’s error on record, but it hands the decision to someone else and does nothing by itself to complete the learning (Std 1.3.1). It ranks above asking your ES because it isn’t asking whether an inaccurate record would be acceptable."
   ],
   [
    "Log only the hour you actually watched, noting that the course is incomplete, and accept that you will be short of hours at the review.",
    "This keeps your record accurate, so it is a strong second, but it leaves you without a full medical emergencies update when ten days and the videos are both available to finish it (Std 1.3.1, 7.3.2)."
   ],
   [
    "Log the certificate as issued so that the review isn’t held up, and make sure you finish the remaining videos before your next appraisal.",
    "Planning to catch up sounds responsible, but the record would claim learning you haven’t done at the point it is reviewed, which is a probity failure regardless of the later intention (Std 1.3.1, 7.3.1)."
   ],
   [
    "Watch the remaining hour of the course this week, and then log the certificate with the full two hours before your e-portfolio review.",
    "Finishing the content makes the certificate true and gives you the emergency knowledge your patients may depend on, and there is time to do it (Std 7.3.2, 1.3.1). It edges out logging only one hour because both are honest, but only this one completes the learning."
   ],
   [
    "Ask your ES at your next tutorial whether logging the certificate as issued is acceptable, given that the site generated it automatically.",
    "Asking for guidance seems prudent, but whether you can claim learning you didn’t do is a question you can answer yourself, and the question hints at a willingness to log it (Std 1.3.1). It sits above logging it as issued because nothing inaccurate has yet been recorded."
   ]
  ],
  "tk": "CPD records must reflect the learning you have actually done; an automatically issued certificate doesn’t change that, and the best response is to complete the learning, not just to avoid claiming it.",
  "r": [
   "1.3.1",
   "7.3.2",
   "7.3.1"
  ]
 },
 {
  "t": "best3",
  "d": "I",
  "g": "I",
  "a": "ES suggests leaving out audit data",
  "k": "ACF",
  "s": "You are ten months into DFT. Your audit of radiograph quality shows that 85–90% of images met the standard in four of six months, but only about 60% in the other two. Your ES, who is also the practice owner, suggests leaving those two months out of your presentation at next week’s study day, because they were ‘atypical’. You know that a new sensor was being set up during one of them, but you don’t know what happened in the other. You will be presenting to your DFT group and your TPD.",
  "o": [
   [
    "Present all six months of results, and explain any factors you have identified that may account for the two poorer months.",
    "Showing the full data, with honest context such as the sensor change, keeps the audit truthful and still lets the audience judge whether the months were atypical (Std 1.3.1)."
   ],
   [
    "Leave out the two months as your ES advised, but state on your methods slide that two months were excluded as atypical.",
    "Disclosing the exclusion is better than hiding it, but the reason is unproven for one month at least, and it still removes the very results the audit exists to find (Std 1.3.1)."
   ],
   [
    "Use the two poorer months to agree improvement actions with the team, and plan a re-audit to check that they have worked.",
    "The poor months are the point of the audit: turning them into actions and a re-audit completes the cycle and protects future patients (Std 1.5.1, 7.3.2)."
   ],
   [
    "Show the four stronger months in the main results, and put the two poorer months in a footnote on your final slide.",
    "Technically nothing is hidden, but relegating the poor months to a footnote presents a misleading picture, so it is a near-duplicate of leaving them out (Std 1.3.1)."
   ],
   [
    "Email the TPD before the study day to ask whether excluding atypical months is acceptable for a DFT audit presentation.",
    "Going to the TPD skips the conversation with your ES that should come first, and it outsources a question about honest reporting that you can answer yourself (Std 1.3.1)."
   ],
   [
    "Explain to your ES in private that leaving out the poorer months would make the results misleading, and listen to their reasons.",
    "Talking it through privately respects your ES, lets you hear anything you don’t know, and makes clear why the data should stay in (Std 1.3.1, 6.1.1)."
   ],
   [
    "Re-run the audit on a fresh sample of recent images before the study day, and present those newer results instead.",
    "It looks diligent, but swapping in a new sample so that the poor months drop out is selective reporting by another route, and it delays the actions they call for (Std 1.3.1)."
   ],
   [
    "Ask to move your presentation to a later study day so that you can investigate what went wrong in those months first.",
    "Understanding the cause is worthwhile, but it can happen alongside presenting the full data and acting on it, so postponing the presentation is mistimed (Std 7.3.2)."
   ]
  ],
  "tk": "Audit data must be reported in full: explain unusual results rather than removing them, raise any pressure to do otherwise with the person privately, and use poor results to drive improvement.",
  "r": [
   "1.3.1",
   "1.5.1",
   "7.3.2"
  ]
 },
 {
  "t": "consider",
  "d": "I",
  "g": "N",
  "a": "Sending work to partner’s lab",
  "k": "EADBC",
  "s": "You are nine months into DFT in an NHS practice. Your partner, Jonah, a GDC-registered dental technician, opened his own laboratory three months ago and has asked whether you would send him your crown work. The practice uses a laboratory chosen by the principal, who is also your educational supervisor, and the practice pays the laboratory fees for your NHS work. Jonah’s prices are about 15% lower. His laboratory is registered with the MHRA as a custom-made device manufacturer, but you haven’t yet seen any of his finished crowns, and you haven’t mentioned the idea to anyone at the practice.",
  "o": [
   [
    "Whether you have told the practice, and patients where relevant, that the laboratory belongs to your partner",
    "A personal interest in where work is sent must be declared openly, so that your choice can be seen to rest on the patient’s benefit rather than private gain (Std 1.3.1, 1.7.6). It ranks just below the quality of the work because honesty about the interest matters only once the work is good enough to consider at all."
   ],
   [
    "How much the practice would save on laboratory fees, given that it pays for your NHS crown work",
    "A lower fee is a legitimate interest for the practice, which bears the cost, but it serves the business rather than the patient and can’t justify a change on its own (Std 1.7.1). It sits above your partner’s interests because it is the practice’s concern rather than yours."
   ],
   [
    "How much a steady flow of NHS work from you would help your partner’s new business become established",
    "Helping your partner is a personal interest, and it is exactly the kind of gain that must never drive clinical decisions (Std 1.7.1). It is relevant only because it creates the conflict of interest, so it is least important."
   ],
   [
    "Whether the practice’s arrangements with its current laboratory allow work to go elsewhere, and who must agree",
    "The principal chose the laboratory and pays the fees, so any change has to go through the practice’s governance and contracts, not your own preference (Std 6.1.1). It ranks below declaring the interest because that declaration is what allows the practice to decide fairly in the first place."
   ],
   [
    "Whether your partner’s laboratory can reliably produce crowns of the quality and fit your patients need",
    "Your patients wear the crowns, so whether the work is safe and of suitable quality is the first test of any laboratory (Std 1.7.1). Without seeing any finished work you can’t yet know, which makes this the deciding question and places it above the declaration."
   ]
  ],
  "tk": "When a personal connection could influence where clinical work goes, put the quality of care for patients first and declare the interest openly before anything else.",
  "r": [
   "1.7.1",
   "1.3.1",
   "1.7.6"
  ]
 },
 {
  "t": "best3",
  "d": "P",
  "g": "I",
  "a": "Neighbour asks for antibiotics",
  "k": "BDH",
  "s": "You are six months into DFT. At 7pm on a Wednesday, at home, your neighbour Mrs Iris Kaur, aged 79, knocks on your door. She isn’t a patient of your practice and has no regular dentist. For three days the gum beside a lower back tooth has been swollen and throbbing. She can open her mouth fully, swallows normally and feels otherwise well. She asks you to come round and take a quick look this evening, and to bring her some antibiotics from work tomorrow, because she has had no luck getting an appointment. Your practice keeps two NHS urgent slots each morning that are open to patients who aren’t registered there.",
  "o": [
   [
    "Look at her gum at her house with a torch, without prescribing, so you can judge how soon she needs to be seen.",
    "This is well meant and stops short of prescribing, but it is an examination with no proper light, instruments, radiograph or record, so any judgement you form is unreliable and blurs the boundary the explanation protects (Std 9.1.4). It is a near-miss of getting her properly assessed tomorrow."
   ],
   [
    "Explain that you can’t examine her or supply antibiotics outside a proper clinical setting, and why that protects her.",
    "Saying clearly what you can’t do, and that it is about her safety rather than unwillingness, keeps a proper boundary while respecting the request (Std 9.1.4). It is the person-focused part of the package and makes sense of the other two."
   ],
   [
    "Bring a three-day course of amoxicillin from practice stock tomorrow, logging it, and ask her to see a dentist next week.",
    "Logging the supply makes this sound accountable, but it is supplying a medicine from the practice to someone who hasn’t been examined and isn’t its patient, with no diagnosis or record behind it (Std 1.3.1, 7.1.1). Antibiotics also don’t replace treating the cause."
   ],
   [
    "Arrange for her to have one of the practice’s urgent slots tomorrow morning, and give her the NHS 111 number for tonight.",
    "This gets her a proper examination within hours through a route that is open to her, and tells her where to turn overnight, which solves the problem she actually came with (Std 2.3.9). It beats leaving her to phone for a slot because she has already struggled to get an appointment."
   ],
   [
    "Advise her to go to the emergency department tonight so that a doctor can assess and treat the swelling.",
    "Erring on the side of caution sounds responsible, but she has no spreading swelling, trismus or difficulty swallowing, so sending her to the emergency department now is disproportionate when dental assessment is available in the morning. It is a near-miss of the safety-net advice."
   ],
   [
    "Ask about her symptoms, allergies and medicines, then write her a private prescription for metronidazole.",
    "Checking her history makes this sound careful, but it is prescribing for a neighbour without an examination or a clinical record, and antibiotics alone don’t treat the cause (Std 7.1.1, 1.4.2). It is the most harmful of the options despite its careful tone."
   ],
   [
    "Tell her to phone the practice at 8am tomorrow and ask for one of the urgent slots, which are open to patients who aren’t registered.",
    "This points her to the right route, but she has already had no luck getting an appointment, and urgent slots go quickly at 8am, so leaving it to her is less reliable than arranging the slot yourself (Std 2.3.9). It is a near-miss of booking her into the urgent slot."
   ],
   [
    "Tell her to phone NHS 111, or 999 if severe, straight away if the swelling spreads or swallowing or breathing becomes difficult.",
    "Dental infections can spread, so clear advice on the warning signs and what to do overnight keeps her safe until she is seen (Std 2.3.9). With the explanation and tomorrow’s urgent slot it completes the response."
   ]
  ],
  "tk": "Kindness to a neighbour means getting her into proper care quickly and safely, not examining or prescribing outside a clinical setting.",
  "r": [
   "9.1.4",
   "2.3.9",
   "1.3.1"
  ]
 },
 {
  "t": "consider",
  "d": "P",
  "g": "H",
  "a": "Phased return after sick leave",
  "k": "BDAEC",
  "s": "You are seven months into DFT and are due back on Monday after four weeks’ sick leave following abdominal surgery. You are recovering well but still tire quickly, and by mid-afternoon you find it hard to concentrate. Your GP’s fit note says you may be fit for work with a phased return, and the occupational health appointment the practice arranged is on Wednesday. The practice manager wants you on a full list from Monday to clear the backlog that built up while you were away. The associates have seen your urgent patients, so the backlog is mostly routine check-ups and planned courses of treatment.",
  "o": [
   [
    "Whether your educational supervisor and TPD need to review how the four-week absence affects your training",
    "Four weeks away is significant in a one-year programme, and your supervisor and TPD may need to know so that your training and sign-off are planned properly. It matters more than the backlog because it affects whether you complete training safely, but it is less pressing than whether you can work safely on Monday."
   ],
   [
    "Whether you could treat patients safely through a full day while you still tire quickly by mid-afternoon",
    "Fatigue that affects concentration is a direct risk to the patients you treat, and you must work within your physical capabilities (Std 7.2.3, 6.2.1). It ranks above the medical advice because that advice exists to answer this question."
   ],
   [
    "Whether working a reduced list for the first few weeks would affect your pay this year",
    "Your income is a real personal concern, but it is your own interest and can’t outweigh patient safety, your recovery or the practice’s needs, so it is least important."
   ],
   [
    "What your GP’s fit note and the occupational health assessment advise about a phased return",
    "You shouldn’t rely on your own judgement of the risk, and the fit note and occupational health advice are how a safe return is decided (Std 9.2.1, 9.2.2). It sits just below patient safety because it is the means of protecting patients rather than the reason."
   ],
   [
    "The practice manager’s aim of clearing the backlog quickly so the practice meets its contract activity",
    "The backlog matters to the practice and the team, but urgent patients have already been seen, so it is mainly a business and scheduling pressure. It ranks below your training, which is a formal obligation that protects future patients, and above your pay because it is the team’s interest rather than yours."
   ]
  ],
  "tk": "When returning from illness, patient safety and proper occupational health advice decide the pace of your return, ahead of the practice’s backlog or your own income.",
  "r": [
   "7.2.3",
   "9.2.2",
   "9.2.1"
  ]
 }
];

// ---- Paper 5 · Advanced (Oct 2026): written by the multi-agent question factory; every key checked blind by three calibrated expert solvers. ----
const RW_5_1 = [
 {
  "t": "rank",
  "d": "P",
  "g": "W",
  "a": "Hypoglycaemia on a home visit",
  "k": "ABCDE",
  "s": "Six months into DFT, you and your dental nurse are on a domiciliary visit to try in a new upper denture for Mr Wilfred Osei, 79, who takes insulin for type 2 diabetes. Partway through, he becomes sweaty, shaky and muddled. His daughter says he skipped lunch. He is conscious, answers your questions slowly but sensibly, and can swallow. Your medical emergency kit contains glucose gel and IM glucagon, and there is orange juice in his kitchen. The nearest ambulance station is about 25 minutes away.",
  "o": [
   [
    "Give him the glucose gel by mouth now, recheck how he is after 10–15 minutes, and repeat the dose if he has not improved.",
    "This is the Resuscitation Council (UK) first-line treatment for a conscious patient who can swallow, and the planned recheck and repeat make it complete (Std 1.5.3). It edges out B because you give a measured dose yourself and judge his recovery objectively."
   ],
   [
    "Stop the try-in, give him a glass of orange juice from his kitchen, and stay with him until he says he feels better.",
    "A sugary drink is an acceptable oral sugar, so this is a close second. It falls just short of A because there is no planned recheck or repeat dose, and his recovery is judged on the word of a man who is still muddled."
   ],
   [
    "Ask your nurse to call 999 first, and then give him the glucose gel by mouth while you all wait for the paramedics.",
    "He is treated, but calling an ambulance before trying first-line care is disproportionate for a conscious patient who can swallow; 999 is for failure to respond or deterioration. It sits below A and B, which treat proportionately, but above options that give the wrong treatment or none."
   ],
   [
    "Give him IM glucagon from the kit, as he is muddled and may not keep the gel down, and then recheck him after 10 minutes.",
    "The wrong first-line drug: he can swallow, so glucagon is not indicated, often causes nausea and uses up the rescue dose you would need if he deteriorated. It still raises his blood glucose, so it sits above withholding treatment altogether."
   ],
   [
    "Keep him seated and observed, and ask his daughter to phone his diabetes nurse for advice before he eats or drinks anything.",
    "This sounds careful, but treating a conscious hypo is within your competence and every minute on hold leaves his blood glucose falling towards unconsciousness. Withholding sugar from a hypoglycaemic patient is the most harmful choice, so it ranks last (Std 1.5.3)."
   ]
  ],
  "tk": "In a medical emergency, give the first-line treatment that matches the patient’s condition and reassess; escalate to stronger drugs or 999 only if they fail to respond.",
  "r": [
   "1.5.3"
  ]
 },
 {
  "t": "best3",
  "d": "E",
  "g": "K",
  "a": "Fluctuating capacity and an LPA",
  "k": "ACF",
  "s": "Eight months into DFT, you are working at a community clinic. Callum, 26, is autistic and has a painful broken lower molar; the options are root canal treatment or extraction. His capacity is known to fluctuate when he is very anxious. Today, in a quiet room with his support worker and picture cards, he explains both options back to you, weighs them and says he wants to keep the tooth. He has coped with fillings at this clinic before. His mother, who holds a registered health and welfare LPA, phones the clinic asking you to arrange extraction under general anaesthetic instead.",
  "o": [
   [
    "Assess and record his capacity for this decision, noting how you supported him, and plan root canal treatment as he has chosen.",
    "Capacity is decision- and time-specific: with support he understands, weighs and communicates his choice now, so the decision is his, and careful recording matters because it fluctuates (Std 3.2.4; MCA principles 1–2). This deals with the immediate problem."
   ],
   [
    "Arrange extraction under GA as his mother requests, as her registered health and welfare LPA lets her decide on his treatment.",
    "It sounds respectful of a legal role, but a health and welfare LPA has no effect while the donor has capacity for the decision, so following it would override a valid choice and remove a tooth he wants to keep. It is the least appropriate option."
   ],
   [
    "Keep the quiet room, picture cards and his support worker at every visit, so he can stay involved in each stage of his treatment.",
    "Taking all practicable steps to support decision-making is an MCA principle and a reasonable adjustment (Std 1.6.3, 3.2.2). Because consent must stay valid at every stage, keeping the supports in place is what protects his capacity as treatment goes on."
   ],
   [
    "Rebook the discussion for a quiet morning appointment, so that his choice can be confirmed at a time when he is least anxious.",
    "Waiting is right when a person may regain capacity, but he has capacity now and is in pain, so rebooking delays care without good reason. A mistimed version of A."
   ],
   [
    "Give Callum an easy-read leaflet on root canal treatment to take home, so he can prepare for what happens at each visit.",
    "Accessible information is a sensible adjustment, but it overlaps with C, which keeps the supports he actually used to decide, and it does nothing about today’s decision or his mother’s request."
   ],
   [
    "With his agreement, explain to his mother that her LPA applies only when he lacks capacity, and agree how she will be involved.",
    "This addresses the person behind the conflict and plans for future visits, within confidentiality because he agrees to it. It helps his mother understand when her LPA would apply (MCA Code ch 7)."
   ],
   [
    "Place a dressing and refer him to the special care service, as his anxiety may make molar root canal treatment hard to complete.",
    "Referral is right when care is beyond your competence, but he has coped with treatment here and wants to keep the tooth, so this defers a decision you can support him to make. Plausible but over-cautious."
   ],
   [
    "Ask your ES to carry out the capacity assessment, as a senior view will carry more weight if his mother disputes the decision.",
    "The clinician proposing the treatment assesses capacity; advice from your ES is fine, but handing over the assessment to head off a dispute defers your own responsibility. Close to A, but weaker."
   ]
  ],
  "tk": "When a person with fluctuating capacity can decide with support, the decision is theirs; a health and welfare LPA applies only when they lack capacity for that decision.",
  "r": [
   "3.2.4",
   "1.6.3",
   "3.2.2"
  ]
 },
 {
  "t": "consider",
  "d": "I",
  "g": "N",
  "a": "Paying to skip the NHS wait",
  "k": "BACDE",
  "s": "Five months into DFT, your training contract is NHS-only. Ms Nadia Rahman needs root canal treatment on a lower molar and has been comfortable since you placed a temporary dressing last week. Your NHS waiting list for root canal treatment is currently ten weeks. She asks whether she can pay you privately to be seen next week instead. An associate at the practice offers private endodontics within three weeks. You are considering how to respond.",
  "o": [
   [
    "The risk that the temporary dressing fails while she waits, and how she can get urgent NHS care if pain returns.",
    "Her clinical safety while waiting matters whichever route she chooses, so it is a close second. It sits just below B because she is comfortable now, so the question in front of you is how to answer her request honestly."
   ],
   [
    "Giving her honest information about NHS and private options, costs and waits, including that NHS care stays available to her.",
    "Her question is about her options, and her right to an informed, unpressured choice is what your answer must protect: she must know NHS treatment remains available and must not be steered towards private care (Std 1.7.4, 2.4). It edges A because she is not at risk today."
   ],
   [
    "Your DFT contract, which does not allow you to treat her privately yourself however willing she is to pay.",
    "A firm limit on what you can offer, so it shapes your answer, but it concerns your obligations rather than her care or safety, which places it below A and B."
   ],
   [
    "Keeping any private referral to the associate documented and clearly separate from her current NHS course of treatment.",
    "Clear records of what is NHS and what is private protect her and the practice (Std 1.7.2), but this is a procedural step that follows once she has chosen, so it sits below C."
   ],
   [
    "Fairness to the other patients on your NHS list, who are waiting for the same treatment in the order they were booked.",
    "Relevant to how the list is run, but choosing private care with the associate is legitimate and does not jump your NHS list, so it is the least decisive consideration."
   ]
  ],
  "tk": "When a patient asks to pay to skip a wait, give her honest information on NHS and private options and keep her safe while she waits, before turning to contractual and administrative points.",
  "r": [
   "1.7.4",
   "2.4",
   "1.7.2"
  ]
 },
 {
  "t": "rank",
  "d": "T",
  "g": "T",
  "a": "Audit partner going quiet",
  "k": "ABCDE",
  "s": "Seven months into DFT, you and two other FDs on your scheme, Josh and Priya, are due to present a joint clinical audit to your TPD at a study day in nine days. Josh agreed to analyse the data and write the results section. He has not sent anything, has missed the last two planning calls, and replied to your last message only with ‘sorry, swamped’. Priya is frustrated and suggests telling the TPD. Nobody has yet asked Josh directly what is going on. Your ES is available for a tutorial later this week.",
  "o": [
   [
    "Phone Josh privately to ask how he is, and agree with him what he can realistically deliver for the audit and by when.",
    "Speaking to a colleague directly and privately comes first: nobody knows yet whether he is struggling, and nine days leaves time to agree a plan with him (Std 6.1). It beats B because you take ownership of a conversation you can have yourself."
   ],
   [
    "Ask your ES for advice on how to approach Josh and how to keep the audit on track, before anyone takes it further.",
    "Advice from your ES is sensible and keeps a possible welfare problem in view, but it delays the direct conversation that A starts. A close second."
   ],
   [
    "Agree with Priya to split Josh’s results section between you, then email Josh to let him know what you have arranged.",
    "This protects the deadline and is open with Josh, but it decides for him without finding out why he has gone quiet and may sideline him. A near-miss below the options that engage with him."
   ],
   [
    "Email the TPD now to explain that Josh has not contributed so far, so that she is aware of the problem before the study day.",
    "The TPD is the right person if things don’t improve, but escalating before anyone has spoken to Josh skips the first rung and may harm a colleague who needs support."
   ],
   [
    "Write the results section yourself so the audit is complete on time, and present it under all three names as planned.",
    "This sounds helpful, but presenting your work as his misrepresents everyone’s contributions to the TPD and hides a possible problem (Std 1.3.1). Dishonesty in an educational setting ranks lowest."
   ]
  ],
  "tk": "When a colleague stops contributing, talk to them privately first because they may be struggling, and never cover the gap by misrepresenting who did the work.",
  "r": [
   "6.1",
   "1.3.1"
  ]
 },
 {
  "t": "rank",
  "d": "E",
  "g": "M",
  "a": "Angry son on triage line",
  "k": "ABCDE",
  "s": "Four months into DFT, you are covering the practice’s triage phone. A man says his mother’s private implant crown, fitted by one of the associates six weeks ago, has come loose after she paid £2,100. He is angry, says he wants to make a formal complaint and asks you to tell him exactly what was done and what she was charged. His mother is 72, has capacity and is not on the call. Her record has no note of consent to share information with him or for him to act on her behalf. The practice manager, who handles complaints, is in the building today.",
  "o": [
   [
    "Acknowledge his frustration, explain her care can’t be discussed without her agreement, and invite her to call about the crown and any complaint.",
    "You handle the call yourself, keep confidentiality and route both the loose crown and the complaint through the patient, who must agree before anyone acts for her (Std 4.2, 5.3). It edges B because without her consent the manager can’t take his complaint forward either, and only A gets her crown looked at."
   ],
   [
    "Explain that her care can’t be discussed without her agreement, then put him through to the practice manager to log his complaint.",
    "A close second: it protects confidentiality and reaches the person who runs the complaints procedure (Std 5.1). It falls just short because the manager is equally limited by the lack of consent, and nothing is done about the loose crown."
   ],
   [
    "Give him the Dental Complaints Service’s details, since the treatment was private and he has said he wants to make a formal complaint.",
    "The Dental Complaints Service is the right body for private care, but only once local resolution has been tried (Std 5.3.11). Offering it first skips the practice’s procedure, though it discloses nothing, so it sits above D."
   ],
   [
    "Take his number and arrange for the associate who fitted the crown to ring him back this afternoon to talk through what happened.",
    "It involves the treating clinician, but it sets up a conversation about her treatment with someone who has no consent to receive it, and commits a colleague before her wishes are known. That risk of disclosure puts it below C."
   ],
   [
    "Read him the dates, treatment and fees from her record so that he can see the crown was fitted and charged as she agreed.",
    "This sounds like clarifying the facts, but it discloses her treatment and costs to a third party without consent, which breaches confidentiality whatever his relationship to her (Std 4.2.1). It ranks lowest because it directly harms her interests."
   ]
  ],
  "tk": "A relative’s strong feelings don’t create consent: handle the call yourself, keep confidentiality and route the complaint and the clinical problem through the patient.",
  "r": [
   "4.2",
   "5.1",
   "5.3"
  ]
 },
 {
  "t": "best3",
  "d": "I",
  "g": "F",
  "a": "AI scribe data breach",
  "k": "ABC",
  "s": "Nine months into DFT, your practice is trialling an AI tool that drafts notes and letters from recorded consultations. This morning you notice that the electronic oral surgery referral you sent yesterday for Mrs Gemma Watts includes the medical history of another named patient, which the tool pulled in from an earlier consultation. You signed the letter off without spotting it. The practice manager, who is the practice’s data protection lead, is in today. The hospital’s referral centre is open until 5pm. Neither patient knows about the error yet.",
  "o": [
   [
    "Phone the hospital referral centre today to ask them to remove the letter, and send a corrected referral for Mrs Watts.",
    "Containing the breach comes first: asking the recipient to remove the other patient’s data limits further spread, and a corrected letter keeps Mrs Watts’s care moving (Std 4.2, 4.5)."
   ],
   [
    "Report it today to the practice manager as a data breach, so she can decide whether the ICO must be told within 72 hours.",
    "The practice is the data controller, so its data protection lead must assess the breach and decide on notification within the legal time limit. Reporting it promptly is your duty; deciding on notification is hers (Std 1.5.4)."
   ],
   [
    "Agree with the practice manager how both patients will be told what happened and offered an apology.",
    "Candour applies to both patients: one has had their data disclosed and the other has had a flawed referral sent under your signature (Std 1.3). Agreeing it with the data protection lead keeps the account consistent and accurate."
   ],
   [
    "Report the breach to the ICO yourself this morning, as you sent the letter and are responsible for checking it.",
    "Taking ownership is commendable, but notification is the controller’s decision, and a parallel report from you bypasses the practice’s procedure and may give an incomplete account. It is well-meant overreach."
   ],
   [
    "Recheck every letter the tool has drafted for you this month, in case other patients’ data has been sent out as well.",
    "Finding out how far the problem goes matters, but that review is for the data protection lead to direct across the trial, and it does nothing for the two patients already affected."
   ],
   [
    "Email the software supplier asking it to delete the other patient’s data from its system and look into the fault.",
    "The supplier will need to be involved, but that is for the data protection lead to coordinate. Contacting it yourself sends more patient data outside the practice and doesn’t retrieve the letter from the hospital."
   ],
   [
    "Raise the episode at your next tutorial with your ES as a learning point about checking AI-drafted letters.",
    "Reflection and learning matter, but waiting until the next tutorial does nothing about the breach today; it is the right action at the wrong time."
   ],
   [
    "Wait until the hospital confirms it has removed the letter before deciding whether either patient needs to be told.",
    "It sounds measured, but candour doesn’t depend on whether containment succeeds, and delaying it is a mistimed version of the keyed disclosure."
   ]
  ],
  "tk": "When patient data has left the practice, contain it, report it to the data protection lead promptly and be open with everyone affected; notification decisions belong to the data controller.",
  "r": [
   "4.2",
   "1.3",
   "4.5"
  ]
 },
 {
  "t": "rank",
  "d": "P",
  "g": "H",
  "a": "Fasting and fitness to treat",
  "k": "ABCDE",
  "s": "Six months into DFT, it is Ramadan and you are fasting. At 1:30pm you nearly faint while standing in the staff room, and ten minutes later you still feel slow and light-headed. Your 2pm list has three surgical extractions, and you break your fast at 7:45pm. Your ES is on site and starts his own list at 2pm. Your nurse noticed you looked unwell and has asked if you are all right.",
  "o": [
   [
    "Tell your ES before 2pm what has happened and agree with him whether the extractions are covered or rebooked.",
    "The near-faint puts your fitness to treat in doubt, and the standard is to consult a suitably qualified colleague promptly and follow their advice rather than judge your own risk (Std 9.2.1). It edges B because your ES can weigh cover against rebooking before the patients are turned away."
   ],
   [
    "Ask reception to rebook the three extractions now, and tell your ES before 2pm what you have done and why.",
    "A close second: it removes the risk to this afternoon’s patients and keeps your ES informed. It falls just short of A because you decide alone and only then tell him, so he can’t offer cover and patients may be rebooked unnecessarily."
   ],
   [
    "Ask your nurse to tell your ES you feel unwell, and rest in the staff room until he has time to come and see you.",
    "This involves the right senior, but through the wrong person and on his timetable: he starts his own list at 2pm, so the patients are left waiting with no decision made."
   ],
   [
    "Rest in the staff room for 20 minutes, then start the extractions only if the light-headedness has completely passed.",
    "Resting is sensible, but the decision to operate still rests on your own judgement of a problem that has just nearly made you faint (Std 9.2.2). It ranks below options that bring in another view or remove the risk."
   ],
   [
    "Start with the simplest of the extractions, with your nurse ready to stop you, and review how you feel before the next.",
    "This sounds cautious and staged, but it still means operating on your own assessment of your fitness and leaves your nurse to halt surgery part-way through. It exposes patients to the most risk, so it ranks lowest (Std 1.7.7)."
   ]
  ],
  "tk": "When your own health may affect your fitness to treat, consult a senior before treating and let that conversation decide; don’t rely on your own sense that you feel well enough.",
  "r": [
   "9.2.1",
   "9.2.2",
   "1.7.7"
  ]
 },
 {
  "t": "rank",
  "d": "T",
  "g": "S",
  "a": "Child discloses at school screening",
  "k": "ABCDE",
  "s": "Ten months into DFT, you are helping the community dental service with screening at a primary school. While you examine Mia, 8, she whispers that her mum’s boyfriend ‘hurts me when Mum’s at work’ and asks you not to tell anyone. You see no injuries to her face or mouth. The school nurse is in the room with you. It is 1:15pm, and the school’s designated safeguarding lead (DSL) is in the building until 3pm. Your service’s safeguarding lead can be reached by phone this afternoon.",
  "o": [
   [
    "Say that you can’t keep it secret, note her exact words, and tell the DSL in person today with the school nurse",
    "This ranks highest: you don’t promise secrecy, you record the disclosure accurately and you take it straight to the person responsible for safeguarding at the school, who is on site and can act before Mia goes home (Std 8.5). The deciding fact is that the disclosure happened at school while the DSL is available."
   ],
   [
    "Say that you can’t keep it secret, note her exact words, and phone your service’s safeguarding lead for advice",
    "A close second: it is a correct route through your own organisation (Std 8.5.2). It ranks just below the top option because advice by phone adds a step, while the DSL on site holds the school’s records and can start the referral today."
   ],
   [
    "Write down her exact words, then give the note to the school nurse to pass to the DSL while you finish the screening",
    "This reaches the right person, but secondhand: you heard the disclosure and should be there to explain it, and a note passed on during a busy session risks delay. It is a near-miss of the top option."
   ],
   [
    "Write down her exact words, then phone children’s social care yourself this afternoon to make a referral",
    "A referral may well be where this ends, but bypassing both the DSL and your own lead goes against local procedure and may fragment the response of people who hold other information (Std 8.5.2). It ranks below the options that use the designated route."
   ],
   [
    "Ask her a few questions about who hurts her, how and how often, so that your referral is as accurate as possible",
    "This sounds thorough, but questioning a child about abuse is investigation, which belongs to social care and the police; it risks leading her and weakening any later evidence. It ranks lowest because it can harm her and the case."
   ]
  ],
  "tk": "When a child discloses abuse, don’t promise secrecy, record her words exactly and take it in person to the designated safeguarding lead on site; don’t investigate.",
  "r": [
   "8.5",
   "8.5.2",
   "4.3.3"
  ]
 }
];

const RW_5_2 = [
 {
  "t": "consider",
  "d": "E",
  "g": "K",
  "a": "Son answers on video call",
  "k": "ABCDE",
  "s": "Eight months into DFT, you hold a booked video review with Mrs Dorothy Lane, 79, about extracting two loose lower incisors and adding them to her partial denture. She has no pain and nothing needs deciding today. Her son, who holds no lasting power of attorney, sits beside her and answers each question you put. When you ask her directly, she says ‘whatever he thinks’. The picture keeps freezing and she seems to struggle to hear you. You have free appointments in clinic next week, and your next video call starts in five minutes.",
  "o": [
   [
    "Whether Mrs Lane can understand and weigh the options herself, starting from the presumption that she can",
    "This comes first because it decides whose decision this is: the law presumes she has capacity, and nothing seen on a frozen video call rebuts that (MCA principle 1; Std 3.2.4). It edges out her wishes only because those wishes carry full weight once her capacity is established."
   ],
   [
    "What Mrs Lane herself wants for her teeth, heard from her and, if she agrees, without her son present",
    "A very close second: consent must be hers and voluntary, and seeing her alone if she agrees is how you separate her view from his (Std 3.1). It sits just below capacity, which tells you how much weight her own answer carries."
   ],
   [
    "Whether a video call is good enough for this decision, when nothing is urgent and she could be seen in person",
    "Her poor hearing and the freezing picture may explain why she defers to her son, so the format is the main practical barrier to supporting her decision (MCA principle 2; Std 3.2.2). It ranks below the first two because it is a means of finding them out, not an end."
   ],
   [
    "Whether her son is supporting her to make the decision or is unduly influencing what she decides",
    "Undue influence would undermine voluntariness, so this matters, but on the facts so far he may simply be compensating for a poor connection. It sits below the format question, which has to be fixed before his role can be judged fairly."
   ],
   [
    "How much another appointment would cost her son, who has taken time off work to join her today",
    "His effort deserves recognition and affects how easily she can attend, but his convenience is the least decisive factor where her consent is at stake. It is still relevant to planning a visit that works for both of them."
   ]
  ],
  "tk": "When a relative answers for a patient and nothing is urgent, presume capacity, hear the patient’s own voice and change the format rather than settle for passive assent.",
  "r": [
   "3.2.4",
   "3.1",
   "3.2.2"
  ]
 },
 {
  "t": "rank",
  "d": "I",
  "g": "C",
  "a": "Own prescribing error flagged",
  "k": "ABCED",
  "s": "Five months into DFT, a community pharmacist phones you at 12:30. This morning you prescribed amoxicillin for Mr Kofi Asante, 46, for a spreading infection from a lower molar; he has facial swelling but no fever and no difficulty swallowing. His medical history, updated last month, records ‘penicillin: anaphylaxis 2019’, and you did not check it before prescribing. He is waiting at the pharmacy and nothing has been dispensed. You have a 15-minute gap before your next patient. Your educational supervisor is in surgery until 1pm.",
  "o": [
   [
    "Cancel the amoxicillin, issue a suitable non-penicillin antibiotic now, and phone Mr Asante yourself to explain and apologise.",
    "The facts are settled, so you put the error right while he is still at the pharmacy and give him the explanation and apology now, as candour requires of the person who made the mistake (Std 1.3). It edges B because you have time to call him now."
   ],
   [
    "Issue a non-penicillin alternative now, and ask the pharmacist to tell Mr Asante you will ring him this evening to explain.",
    "A close second: the safety problem is fixed as fast as in A and you still plan to explain yourself, but the explanation and apology are put off for hours when you have time to give them now (Std 1.3)."
   ],
   [
    "Ask the pharmacist to hold the prescription, and agree an alternative with your supervisor at 1pm before phoning Mr Asante.",
    "It keeps him safe and you still tell him yourself, but it defers by half an hour a decision you are competent to make while he waits with a spreading infection. Deferral sits below the options that act now."
   ],
   [
    "Ask the pharmacist to cancel the amoxicillin and advise Mr Asante to book an appointment tomorrow for a new prescription.",
    "The dangerous drug is never dispensed, but a spreading infection goes untreated overnight and the explanation of your own error is handed to someone else (Std 1.3, 1.7). The patient bears the cost of your mistake, so it is the least appropriate."
   ],
   [
    "Phone Mr Asante to go back over his allergy history with him before deciding whether the prescription needs changing.",
    "Speaking to him sounds thorough, but the record and the pharmacist have already settled the facts, and second-guessing a documented anaphylaxis risks him being given a penicillin while treatment waits. He is at least spoken to and treated today, which keeps it above leaving the infection untreated overnight."
   ]
  ],
  "tk": "When a stem settles the facts of your own error, correct it and tell the patient yourself straight away; candour and repair are not things to defer or delegate.",
  "r": [
   "1.3",
   "1.5.4"
  ]
 },
 {
  "t": "best3",
  "d": "T",
  "g": "R",
  "a": "Locum radiographs without justification",
  "k": "ABC",
  "s": "Six months into DFT, you are working on a hospital community-outreach day for people who are homeless. The locum dentist on the next chair is taking two bitewings and a periapical on every patient before examining them, ‘to save time’, and is not recording any justification. Eleven patients are still waiting to be seen. The senior nurse, who is the radiation protection supervisor for the clinic, is on site now. The consultant clinical lead arrives at 1pm. You do not supervise the locum, and your educational supervisor is at your training practice.",
  "o": [
   [
    "Speak to the locum privately now about justifying and recording each exposure before it is taken",
    "1.1)."
   ],
   [
    "Tell the radiation protection supervisor on site this morning what you have seen on the clinic",
    "2.3)."
   ],
   [
    "Make sure the exposures already taken are logged on the hospital’s incident reporting system today",
    "5.4)."
   ],
   [
    "Ask the nurses on the clinic not to take any more radiographs until the locum has examined each patient",
    "Well-meant overreach: you have no authority over the locum’s requests or the nurses’ roles, and this bypasses the supervisor who does."
   ],
   [
    "Report the locum to the GDC today, since the unjustified exposures breach the radiation regulations",
    "Sounds responsible but is premature: local routes are available and untried, and nothing yet suggests a cover-up or that local action will fail (Std 8.2.5)."
   ],
   [
    "Tell the patients already x-rayed today that their radiographs were not clinically needed",
    "Candour may follow, but you have not reviewed each case, and some exposures may have been justifiable; the organisation should decide this after review."
   ],
   [
    "Discuss it with your educational supervisor at next week’s tutorial and agree how to report it",
    "Your supervisor is a good source of advice, but next week is too late for patients being exposed today, and the supervisor is not responsible for this clinic."
   ],
   [
    "Wait for the consultant clinical lead to arrive at 1pm and tell her what you have seen",
    "The right kind of step with a senior, but mistimed: the supervisor is on site now, and several more patients could be exposed before 1pm."
   ]
  ],
  "tk": "When a colleague’s practice is exposing patients to avoidable harm, speak to them, involve the person responsible on site now, and make sure the incident is recorded.",
  "r": [
   "8.1.1",
   "1.5.1",
   "8.2.3"
  ]
 },
 {
  "t": "rank",
  "d": "P",
  "g": "P",
  "a": "One slot, two urgent patients",
  "k": "ABCDE",
  "s": "Ten months into DFT, at 4pm in an urgent dental care session, you have one free slot left. A 6-year-old girl has a facial swelling that is closing her left eye and a temperature of 39.4°C, and her mother says she has barely drunk today. A man who had a lower molar extracted this morning has been oozing for three hours despite biting on gauze; he takes apixaban and is otherwise well. A colleague in the next surgery will finish with her patient in ten minutes. The session lead can be reached by phone.",
  "o": [
   [
    "Phone the on-call maxillofacial team and send the girl to hospital now, then see the bleeding patient in your slot.",
    "Her eye closing, high fever and poor fluid intake are red flags that need hospital care, which urgent dental care cannot give, and the man’s bleeding is something you can manage now in your free slot (Std 6.3.3). It edges B because neither patient waits."
   ],
   [
    "Phone the on-call maxillofacial team and send the girl to hospital now, then ask your colleague to see the bleeding patient when she is free.",
    "A close second: the girl gets exactly the right care, but the man waits at least ten more minutes for a colleague who is still busy when your own slot is free. Same referral, wrong person for the second patient."
   ],
   [
    "See the girl first in your slot to examine the source of the swelling, then refer her to the maxillofacial team.",
    "The referral is right, but the stem already gives the red flags, so examining her first delays definitive care and keeps the bleeding patient waiting. It still ends with timely referral, so it sits above D."
   ],
   [
    "Phone the session lead to decide which of the two patients should have the slot, and see whichever one they choose.",
    "Seeking advice is reasonable, but at month ten this triage decision is within your competence, and deferring it delays both patients. Neither is given the wrong care, so it sits above E."
   ],
   [
    "See the girl in your slot, prescribe antibiotics and give her mother clear advice on when to seek help, while the man waits.",
    "It sounds caring because it prioritises the child, but oral antibiotics and safety-netting are not enough for a spreading infection with eye closure, fever and poor intake, and the bleeding patient waits as well (Std 7.2)."
   ]
  ],
  "tk": "Prioritise by what each patient needs and where they can get it: a child with red-flag signs needs hospital now, which frees you to treat what you can.",
  "r": [
   "6.3.3",
   "7.2"
  ]
 },
 {
  "t": "rank",
  "d": "E",
  "g": "F",
  "a": "Reporter after a collapse",
  "k": "BEDAC",
  "s": "Seven months into DFT, a reporter from the local paper rings your mobile at lunchtime. Last week a patient collapsed in your practice’s waiting room and was taken to hospital. His daughter has since posted on Facebook, naming you and saying staff ‘just stood around’. You know the team followed the emergency protocol. The reporter says the story runs tomorrow and wants ‘your side’. The practice manager handles all media enquiries, and the daughter’s formal complaint is already open. The reporter is still on the line.",
  "o": [
   [
    "Reply under the daughter’s post that you can’t discuss anyone’s care online, and give the practice’s complaints contact details.",
    "It discloses nothing, but it answers a live complaint in public, keeps the dispute on social media and bypasses the practice’s media route (Std 4.2.3). It ranks above C only because no health information is shared."
   ],
   [
    "Say you can’t comment on any individual or confirm whether anyone is a patient, and give the reporter the practice manager’s details.",
    "This handles the call correctly yourself: confidentiality covers even whether someone is a patient, and the practice manager is the agreed route for media enquiries (Std 4.2.1). It edges E because it uses the route the practice has set up and leaves the reporter nothing to wait for."
   ],
   [
    "Give the reporter a brief, factual account of how the team treated him during the collapse, without naming him, to set the record straight.",
    "Leaving out his name doesn’t anonymise anything, because the post already identifies him, so any account of his emergency care discloses his health information to the press (Std 4.2.1, 4.3). Correcting an unfair story isn’t an exceptional ground for disclosure, so it ranks lowest."
   ],
   [
    "Tell the reporter you’ll send a short written statement this afternoon, once the practice manager has approved its wording.",
    "Routing it through the practice manager adds a check, but it commits you to commenting on an identifiable patient’s care and keeps you as the media contact. Nothing has been disclosed yet, so it sits above the public reply."
   ],
   [
    "Say you can’t comment on any patient, end the call, and ring your indemnity provider for advice before the story runs.",
    "A close second: it gives nothing away, and advice is sensible with a complaint open and a story pending. It falls just short of B because it doesn’t point the reporter to the practice manager, the step the advice would recommend anyway."
   ]
  ],
  "tk": "Confidentiality covers even whether someone is a patient; an unfair public story doesn’t justify disclosure, so decline to comment and use the practice’s media route.",
  "r": [
   "4.2.1",
   "4.3",
   "4.2.3"
  ]
 },
 {
  "t": "best3",
  "d": "I",
  "g": "I",
  "a": "Honesty with a CQC inspector",
  "k": "BEH",
  "s": "Nine months into DFT, it is CQC inspection day. An inspector stops you in the corridor and asks whether the emergency drugs are checked every week. Yesterday you saw a nurse sign off four weeks of checks in one sitting. Last week you noticed the adrenaline was past its expiry date; you mentioned it to her, but you don’t know whether it has been replaced. Your ES, who owns the practice and oversees the checks, is in a meeting with the lead inspector for the next hour. You have patients booked all afternoon.",
  "o": [
   [
    "Ask the inspector whether you can speak to your ES before answering, as he is responsible for the practice’s checking system.",
    "This sounds courteous and loyal, but it delays a factual answer to a regulator and can look like checking what to say. It is a near-miss of answering honestly now and telling him afterwards."
   ],
   [
    "Tell the inspector you aren’t sure the checks are weekly, and describe factually what you saw yesterday and last week.",
    "You owe a regulator a full and truthful answer, given factually and without speculation (Std 9.4). Unlike deferring or redirecting, this deals with the question in front of you."
   ],
   [
    "Explain that you don’t carry out the drug checks yourself, and suggest the inspector asks the practice manager, who keeps the log.",
    "It isn’t untrue, but it withholds first-hand information from an inquiry by sending the inspector elsewhere (Std 9.4). It protects you rather than patients."
   ],
   [
    "Speak privately to the nurse today about signing off several weeks at once, and explain how the checks should be recorded.",
    "This is reasonable later, but the failure is in a system your ES owns, and raising it with her mid-inspection can look like coaching. It addresses one person rather than the safety risk or the system."
   ],
   [
    "Check the emergency drug kit yourself today, and make sure the expired adrenaline has been replaced before your afternoon list.",
    "Expired adrenaline is a direct risk to any patient who has anaphylaxis, and it may not have been fixed since you raised it, so it needs securing today whatever the inspection finds (Std 1.5.3)."
   ],
   [
    "Contact the GDC after the inspection to report that the practice isn’t carrying out its emergency drug checks properly.",
    "This is premature and disproportionate: the CQC is already inspecting, and the practice hasn’t had a chance to put its system right (Std 8.2.5)."
   ],
   [
    "Tell the inspector the practice keeps a weekly checking log and offer to show it, then raise your doubts with your ES later.",
    "Every word may be true, but presenting a log you believe is unreliable as evidence of weekly checks misleads the inspector, and raising doubts later doesn’t undo that (Std 1.3, 9.4)."
   ],
   [
    "Tell your ES after his meeting what you said to the inspector and why, and ask how the checking system will be reviewed.",
    "Your ES owns the practice and the checks, so he should hear from you what you told the inspector; being open with him lets the practice respond and fix the system (Std 8.1.1)."
   ]
  ],
  "tk": "When a regulator asks, give a full and truthful answer from what you have seen, secure the safety risk, and be open with your employer about what you said.",
  "r": [
   "9.4",
   "1.3",
   "1.5.3"
  ]
 },
 {
  "t": "rank",
  "d": "T",
  "g": "W",
  "a": "Delegating beyond training",
  "k": "CDEAB",
  "s": "Three months into DFT, you are working at a community school-screening clinic. Fourteen children are listed for fluoride varnish after their check, and their parents have consented. The nurse trained to apply it is off sick. The clinic manager asks you to let Priya, a first-year trainee dental nurse, apply the varnish ‘under your supervision’ to keep the list moving. Priya hasn’t been trained in varnish application, and her course doesn’t cover it until next year. You are competent to apply it, though doing so yourself will make the session run about 30 minutes late.",
  "o": [
   [
    "Ask the manager to rebook the children’s varnish for next week, when the trained nurse is expected to be back at work.",
    "Rebooking is safe, but it denies 14 children care you can give today and adds a burden for families and the school. It sits below E because it causes a definite loss of care rather than just leaving it unplanned."
   ],
   [
    "Agree to the plan, provided you watch each application closely and countersign every record, so the children are still treated.",
    "Close watching sounds responsible, but supervision doesn’t make an untrained task safe or within scope, and you stay accountable for delegating it (Std 6.3.1). It also pressures a trainee into something she hasn’t been taught (Std 6.3.2)."
   ],
   [
    "Tell the manager you’ll apply the varnish yourself, with Priya nursing for you, so that all 14 children are still treated today.",
    "This keeps every child’s preventive care going and keeps Priya within her training, while she still supports you safely (Std 6.3.1). It edges D because it is a decision within your competence that you can make now."
   ],
   [
    "Phone your ES to check he agrees, then apply the varnish yourself with Priya nursing so that all 14 children are treated today.",
    "A close second: the outcome is the same as C, but you are checking a decision you are competent to make yourself, which adds delay to a list already running late."
   ],
   [
    "Explain to the manager why Priya can’t apply varnish yet, and suggest the service arranges her training before future clinics.",
    "This gives the manager the reason and helps future clinics, but on its own it leaves today’s 14 children without a plan. It sits below the options that treat them today."
   ]
  ],
  "tk": "Delegate only to someone trained and competent; when you can do the task yourself, do it, rather than letting supervision stand in for training.",
  "r": [
   "6.3.1",
   "6.3.2",
   "7.2.1"
  ]
 },
 {
  "t": "rank",
  "d": "E",
  "g": "M",
  "a": "Misgendered by reception",
  "k": "CBEAD",
  "s": "Six months into DFT, Alex Rowe, 34, who is transgender, is in your chair for a filling. He tells you that at each of his last three visits the receptionist has called him ‘she’ and used his previous name in the waiting room. Two months ago he asked reception to update his record, but it still shows his old name and gender. He is upset, says he is thinking of moving practice, and adds that he doesn’t want ‘a scene’. The practice manager is in today, and your next patient is due in ten minutes.",
  "o": [
   [
    "Have a quiet, informal word with the receptionist after the session, reminding her to use Alex’s name and pronouns.",
    "A word may change one receptionist’s behaviour, but it leaves the wrong name and gender on his record, so other staff will repeat the mistake. It also does nothing for Alex in the chair."
   ],
   [
    "Tell Alex you’ll raise it with the practice manager today, so that his record is corrected and the reception team is trained.",
    "This fixes the record and the team’s training, but announcing it without first acknowledging his experience or asking what he wants risks the ‘scene’ he wants to avoid. It is the right system step taken before the personal one."
   ],
   [
    "Acknowledge what has happened and apologise, then agree with Alex how his record will be corrected before he leaves.",
    "Acknowledging the harm and apologising, then agreeing the fix with him, puts his dignity and wishes first and removes the cause today (Std 1.6.1, 2.1.1). It edges the manager option because it starts with what Alex wants."
   ],
   [
    "Reassure Alex that the receptionist is unlikely to have meant any offence, and promise him it won’t happen at his next visit.",
    "Speculating that no offence was meant minimises his experience, and the promise is one you can’t keep while the record is still wrong (Std 1.6.1). It sounds reassuring but leaves the cause in place."
   ],
   [
    "Apologise to Alex, and suggest he asks reception to update his name and gender again on his way out so the record is put right.",
    "Apologising is right, but sending Alex back to the desk that has already failed him three times shifts the work of fixing the practice’s error onto him. It still ranks above the options below because the record may be corrected."
   ]
  ],
  "tk": "When a patient’s dignity has been harmed, acknowledge and apologise for their experience, agree the fix with them, and correct the record that caused it.",
  "r": [
   "1.6.1",
   "2.1.1",
   "4.1"
  ]
 }
];

const RW_5_3 = [
 {
  "t": "best3",
  "d": "P",
  "g": "S",
  "a": "Neglect at care-home screening",
  "k": "BDF",
  "s": "Seven months into DFT, you and your nurse are screening 12 residents at a care home, with 15 minutes each, a portable kit and the minibus back at 4pm. Mr Albert Fenwick, 86, has advanced dementia and lacks capacity for decisions about his care. He has visibly lost weight, his lower denture has caused an untreated ulcer and his oral hygiene is very poor. As you finish, a care worker quietly tells you the home manager has told staff not to write down weight loss before an inspection. His notes name a social worker who is reviewing his funding. Four residents are still waiting to be seen.",
  "o": [
   [
    "Speak to the home manager before you leave, so she can respond to what you have found.",
    "Raising a concern with the manager first is normally right (Std 8.2.3), but here she is the alleged source, so going to her first risks records being changed and the care worker being exposed. It is a near-miss of the safeguarding referral, not a substitute for it."
   ],
   [
    "Ease the denture over the ulcer with your portable kit and book a review in two weeks.",
    "Relieving his pain and removing the cause of the ulcer is the immediate clinical need, while keeping the denture usable for a man who is losing weight; the review checks it heals, since a non-healing ulcer needs urgent referral (Std 1.4)."
   ],
   [
    "Email the social worker named in his notes, setting out your findings for her review.",
    "Better than keeping the concern within the home, but she is handling his funding rather than safeguarding, and an email to one person bypasses the local procedure that routes concerns to the adult safeguarding team (Std 8.5.2)."
   ],
   [
    "Record your findings objectively, including the care worker’s words as she said them.",
    "Clear, contemporaneous notes of what you saw and what you were told are the evidence a safeguarding team relies on (Std 4.1.2). Recording, not investigating, is the dental team’s role, and it pairs with the referral."
   ],
   [
    "Photograph the ulcer and his hygiene on your phone so the evidence is clear and dated.",
    "It sounds like careful evidence-gathering, but images on a personal phone breach confidentiality, and he cannot consent to them (Std 4.2.9). Written records, or images taken on practice equipment under policy, achieve the same without the breach."
   ],
   [
    "Tell the practice safeguarding lead today so a referral goes to adult social care.",
    "Neglect of an adult at risk, together with a possible instruction to leave records incomplete, meets the threshold for a referral today (Std 8.5.1). Going through the practice lead follows local procedure, and the manager’s involvement makes the home’s own route unsuitable."
   ],
   [
    "Phone his son tonight to explain your concerns and ask him to take them up with the home.",
    "Family can contribute to best-interests decisions, but this hands the concern to someone without the role or power to protect him, and it shares his information before the proper referral is made."
   ],
   [
    "Advise the staff to leave his lower denture out until the ulcer heals, and review it in two weeks.",
    "Leaving the denture out lets the ulcer heal, but it makes eating harder for a man who is already losing weight, when easing the flange removes the cause and keeps the denture in use."
   ]
  ],
  "tk": "When the usual first contact is the source of a safeguarding concern, treat the patient, record objectively and refer through the safeguarding lead rather than the home’s manager.",
  "r": [
   "8.5.1",
   "8.2.3",
   "4.2.9"
  ]
 },
 {
  "t": "rank",
  "d": "I",
  "g": "K",
  "a": "Competent 16-year-old’s confidentiality",
  "k": "ABCDE",
  "s": "Five months into DFT, Ellie, 16, attends alone during her school lunch hour with irreversible pulpitis in a lower first molar. You explain root canal treatment, extraction and no treatment, with the costs of each. She weighs the options clearly, asks sensible questions and chooses root canal treatment, starting today. She asks you not to tell her father, who she says ‘will go mad’ that she left school. Nothing she says suggests any risk at home. As you finish the consent discussion, reception tells you her father has just phoned asking whether she came in today, and wants a call back.",
  "o": [
   [
    "Treat her today on her own consent, keep the visit confidential and encourage her to tell her father herself",
    "A 16-year-old is presumed able to consent (Family Law Reform Act 1969), and Ellie has shown she understands, so her consent is enough and her confidentiality covers her father’s call (Std 3.1, 4.2.1). It edges the next option because guidance favours encouraging, not requiring, family involvement."
   ],
   [
    "Treat her today on her own consent, then agree with her how future letters and calls should be handled",
    "Respects her consent and protects her privacy going forward, so it is a strong choice. It sits just below the top because it settles the logistics without encouraging her to involve her father, which is the good practice guidance describes."
   ],
   [
    "Place a dressing to settle the pain and book the root canal for when her father can attend with her",
    "Relieves her pain, so it is safer than it first appears, but it treats parental involvement as a requirement when it isn’t, delays the care she chose and implies her father will be told. Passive rather than harmful, so it sits in the middle."
   ],
   [
    "Call her father back to confirm she attended today, but give him no clinical details about her care",
    "Feels like a fair compromise, but the fact that she attended is itself confidential, and she asked you not to share it (Std 4.2.1). A quiet breach, though less damaging than overriding her outright."
   ],
   [
    "Explain to Ellie that, because she is under 18, you will need to let her father know about today’s visit",
    "Sounds responsible, but it misstates the law, overrides a competent young person’s confidentiality and may deter her from returning for care. It combines a breach with misinformation, so it ranks lowest."
   ]
  ],
  "tk": "A 16-year-old who understands the decision can consent for herself, and her confidentiality holds against a parent’s enquiry; encourage, never require, family involvement.",
  "r": [
   "3.1",
   "4.2.1",
   "2.2"
  ]
 },
 {
  "t": "consider",
  "d": "P",
  "g": "P",
  "a": "RCP week clinical crunch",
  "k": "ABCDE",
  "s": "It is month 12 of DFT, and your Review of Competence Progression (RCP) is next Tuesday. Your e-portfolio closes at 5pm on Friday, and two items still need your ES’s sign-off; your ES has offered you protected time on Thursday morning to finish them. Today the associate is off sick, and your ES asks you to see three emergency patients in pain this afternoon, one of whom has a facial swelling. The only free slot was set aside for writing reflections. You also missed last week’s study-day tutorial, and your TPD has asked you to catch up on it before the end of term. Your ES is in the next surgery all afternoon.",
  "o": [
   [
    "The urgent clinical needs of the three patients, particularly the one with facial swelling",
    "The most immediate and serious interest at stake: a facial swelling can spread and needs assessing today, and the other two are in pain (Std 1.7). It outranks everything about your own week."
   ],
   [
    "Whether you can assess and treat all three of them safely in the time you have available",
    "Close to the top, because seeing them is only right if it can be done safely. At month 12, with your ES next door, that is likely, which is why it sits just below the patients’ need itself (Std 7.2, 6.2.1)."
   ],
   [
    "Whether your two outstanding portfolio items can still be completed honestly by Friday",
    "Matters for your progression and must be done honestly, but the Thursday time your ES has offered keeps it achievable, so it shouldn’t displace patients in pain today. If it slips, tell your TPD early rather than rushing or overstating work (Std 1.3.1)."
   ],
   [
    "How tired you are likely to be by the end of what is already a very heavy week",
    "Relevant, since a tired clinician is less safe, but it concerns you rather than the patients and is a forecast about later in the week rather than a limit on this afternoon (Std 9.2)."
   ],
   [
    "Catching up on the content of the study-day tutorial that you missed last week",
    "Your TPD has asked for it and it should be done, but it has no deadline this week and no bearing on anyone’s safety, so it is the least decisive here."
   ]
  ],
  "tk": "When your deadlines are still achievable, patients in urgent need come first, judged against whether you can see them safely; your own development fits around them.",
  "r": [
   "1.7",
   "7.2",
   "1.3.1"
  ]
 },
 {
  "t": "rank",
  "d": "T",
  "g": "T",
  "a": "Wrong-patient crown at try-in",
  "k": "ABCDE",
  "s": "Nine months into DFT, at 3pm, you are trying in a bonded crown on Mr Dev Shah’s upper right first molar. It rocks, and the shade is clearly wrong. The lab ticket has his name on it, but the stone model plainly matches Mrs Hart, whose impression was taken the same morning. Your trainee nurse, Amy, eight weeks into her course, labelled both impressions, and she goes pale. Nothing has been cemented. Mr Shah asks you directly whether something is wrong. Your ES is with a patient until 5pm.",
  "o": [
   [
    "Tell Mr Shah the crown was made from another patient’s impression, apologise and arrange new impressions at no cost.",
    "The facts are clear and he has asked directly, so candour applies now: tell him what happened, apologise and put it right (Std 1.3). An apology for the practice’s error isn’t an admission of liability and needn’t name Amy. It edges B because it answers the question he asked."
   ],
   [
    "Apologise to Mr Shah that the crown doesn’t fit, arrange new impressions at no cost, and log the incident with your ES.",
    "A close second: he gets an apology and a remedy, and logging the incident starts the learning, including a check on Mrs Hart’s crown (Std 1.5.4). It falls just short because he asked what was wrong and isn’t told, when the facts are already known."
   ],
   [
    "Retake Mr Shah’s impressions now, remake the crown free of charge and sort out the labelling with Amy.",
    "Fixes the problem for him and sounds efficient, but he isn’t told why or offered an apology, no incident is recorded and Mrs Hart’s case may go unchecked. It still puts things right, so it sits above D."
   ],
   [
    "Tell Mr Shah something has gone wrong with the crown, and that you’ll explain fully once your ES is free at 5pm.",
    "Honest that there is a problem and commits to explaining, but defers a conversation you are able to have now and leaves him waiting with no remedy. Passive, so it sits below the options that act today."
   ],
   [
    "Ask Amy to explain the labelling mix-up to Mr Shah herself, as she made the error and the apology should come from her.",
    "It sounds like accountability, but the treating clinician is the right person to explain and apologise, and this singles out a distressed trainee in front of a patient (Std 6.1). Shifting candour onto a junior colleague ranks lowest."
   ]
  ],
  "tk": "When the facts are clear and the patient asks, candour means telling him what happened and apologising now; supporting the colleague and logging the incident follow.",
  "r": [
   "1.3",
   "1.5.4",
   "6.1"
  ]
 },
 {
  "t": "best3",
  "d": "E",
  "g": "N",
  "a": "NHS care withheld by policy",
  "k": "ABC",
  "s": "Eight months into DFT, Mr Daniel Mensah, 44, has irreversible pulpitis in a restorable lower right second molar with straightforward canal anatomy on the radiograph. You have completed several molar root canal treatments with good outcomes, and your ES has signed you off for them. Last month the practice manager told FDs that molar root canals are not offered on the NHS here because of activity targets, so patients should be offered private treatment at £750 or an extraction. Mr Mensah is anxious, on a low income, and says he wants to keep the tooth but cannot afford private fees. Your ES is in the practice today.",
  "o": [
   [
    "Tell him root canal treatment is available on the NHS here, alongside extraction and private care, and what each costs.",
    "This deals with the immediate problem: the treatment is routine, within your signed-off competence and part of NHS care, so implying it is private-only would breach Std 1.7.3 and 1.7.4."
   ],
   [
    "Raise the manager’s instruction with your ES today, explaining why it conflicts with NHS obligations to patients.",
    "The system fix at the right rung: the manager is the source of the instruction, so it goes to your ES, who is available today (Std 8.1.1, 8.2.3). It beats asking the manager for a one-off exception (G) and going to the commissioner first (E)."
   ],
   [
    "Record the options, costs and Mr Mensah’s decision in his notes, and give him a written NHS treatment plan.",
    "Completes the package: a clear record and written plan protect Mr Mensah and show the NHS and private split was explained (Std 2.3.7, 4.1.2). It adds what neither A nor B covers."
   ],
   [
    "Explain all the options to Mr Mensah, and book NHS root canal treatment once your ES confirms the practice will allow it.",
    "A mistimed near-duplicate of A: the information is right, but making his NHS care wait on permission leaves him in pain and uncertain, when the treatment is already part of the practice’s NHS obligations."
   ],
   [
    "Report the policy to the NHS commissioner today, as it restricts care the practice is contracted to provide.",
    "The concern is valid but this skips a rung: your ES is not the source of the problem and is in today, so local escalation comes first (Std 8.2.3, 8.2.4)."
   ],
   [
    "Offer Mr Mensah the private root canal treatment at a reduced fee, so that cost does not force him into an extraction.",
    "Well-meant, but it still steers him to private care for treatment he is entitled to on the NHS, which Std 1.7.4 forbids, and the fix applies only to him."
   ],
   [
    "Ask the practice manager whether an exception to the policy can be made for Mr Mensah, given his circumstances.",
    "Speaking to the person first is often right, but here it treats NHS care as a favour, delays his treatment and leaves the policy in place for every other patient; B is the better route."
   ],
   [
    "Tell Mr Mensah the practice’s policy is wrong and that he is entitled to have the root canal treatment here.",
    "The factual message overlaps with A, but criticising the practice to a patient undermines colleagues and trust (Std 9.1.2); disagreements belong with your ES."
   ]
  ],
  "tk": "When a practice rule withholds NHS care that is clinically indicated and within your competence, offer the patient that care and all the options honestly, and take the rule to your ES.",
  "r": [
   "1.7.3",
   "1.7.4",
   "8.1.1"
  ]
 },
 {
  "t": "rank",
  "d": "P",
  "g": "W",
  "a": "Latex anaphylaxis in the chair",
  "k": "ABCDE",
  "s": "Four months into DFT, two minutes after you place a latex rubber dam, Mrs Grace Adebayo, 38, becomes flushed, her lips swell, and she develops an audible wheeze and a hoarse voice. She says she feels faint, and she is pale and clammy. Your nurse is beside you. The emergency drug kit and oxygen are kept in the corridor just outside. Your ES is with a patient in the next surgery. You completed your annual medical emergencies training last month. Her partner is in the waiting room.",
  "o": [
   [
    "Remove the dam and gloves, lay her flat with legs raised, and have your nurse call 999 and bring the kit and your ES.",
    "This removes the trigger, protects her circulation, summons the ambulance and brings the adrenaline and senior help, so it covers the most life-saving ground (Resuscitation Council UK; Std 1.5.3). It edges B because B depends on a kit that nobody in B has yet fetched, and leaves the latex in place."
   ],
   [
    "Give IM adrenaline 500 micrograms into her outer thigh once the kit arrives, and repeat after 5 minutes if needed.",
    "Adrenaline is the definitive treatment and you are trained to give it, so this is a strong second (Std 1.5.3). On its own it leaves the trigger in place, her sitting up and no ambulance called."
   ],
   [
    "Remove the dam, give high-flow oxygen by face mask and monitor her closely to see whether her symptoms begin to settle.",
    "Removing the trigger and giving oxygen are both correct, which keeps this above D, but watching to see if things settle is passive when signs of shock are already present."
   ],
   [
    "Give salbutamol from the kit for her wheeze, then reassess her breathing before deciding whether she needs adrenaline.",
    "It treats one symptom and actively postpones adrenaline in a patient with airway and circulation features; salbutamol is only an add-on once adrenaline has been given."
   ],
   [
    "Send your nurse next door to fetch your ES, so that the ES can confirm the diagnosis before any adrenaline is given.",
    "Sounds prudent, but airway or breathing problems plus signs of shock already make the diagnosis, and you are trained to give IM adrenaline; waiting for a senior to confirm it delays life-saving treatment within your competence (Std 1.5.3)."
   ]
  ],
  "tk": "In suspected anaphylaxis, remove the trigger, lay the patient flat, call an ambulance and give IM adrenaline yourself; never wait for a senior to confirm what the signs already show.",
  "r": [
   "1.5.3",
   "8.1"
  ]
 },
 {
  "t": "best3",
  "d": "T",
  "g": "R",
  "a": "Owner discourages urgent cancer referrals",
  "k": "ABC",
  "s": "Six months into DFT, the practice owner, who is not your ES, emails all clinicians saying they should stop making urgent suspected-cancer referrals and instead ‘review in a month’ to cut administration time. That afternoon you see Mrs Pauline Hughes, 61, a smoker, who has a firm, painless ulcer with rolled edges on the side of her tongue. She says it has been there for four weeks. There is no obvious cause such as a sharp tooth. This lesion meets the NICE criteria for an urgent suspected-cancer referral. Your ES is in the practice today.",
  "o": [
   [
    "Make an urgent suspected-cancer referral for Mrs Hughes today, explaining why it is needed and what happens next.",
    "This deals with the immediate risk: the lesion meets NICE criteria, and an employer’s instruction never outranks a patient’s safety (Std 7.1, 8.1.1). It beats asking the ES to confirm the referral (H), because she is your patient and the referral is within your competence."
   ],
   [
    "Raise the owner’s instruction with your ES today, explaining the risk it poses to patients like Mrs Hughes.",
    "The system fix at the right rung: the owner is the source, so the concern goes to your ES, who is in today (Std 8.2.3). It outranks going straight to NHS England (E), which skips a rung that has not yet failed."
   ],
   [
    "Record your findings, the referral and your reasoning in her notes, including the guidance you followed.",
    "Completes the package with a clear, contemporaneous record that justifies your decision and supports any later review (Std 4.1). It adds something A and B do not."
   ],
   [
    "Discuss Mrs Hughes’s case with the owner before referring, so that the owner understands why this lesion cannot wait.",
    "Talking to the person is usually a good first step with a concern, but making the referral wait on the source of the instruction delays a patient who needs it today."
   ],
   [
    "Report the owner’s instruction to NHS England today, as it puts patients across the whole practice at risk.",
    "The worry is justified, but this is premature: local escalation through your ES is available today and has not failed (Std 8.2.4)."
   ],
   [
    "Give Mrs Hughes smoking-cessation advice and details of the local stop-smoking service while she waits to be seen.",
    "Prevention advice matters for a smoker, but it is secondary today: it does nothing about the referral, the record or the instruction that put patients like her at risk."
   ],
   [
    "Photograph the ulcer and review it in two weeks, referring urgently if it shows no clear sign of healing.",
    "Sounds careful, but the ulcer has already lasted four weeks with no cause, so a further review is the same delay the owner’s email proposes."
   ],
   [
    "Ask your ES to see Mrs Hughes and confirm the referral before you send it, given the owner’s instruction.",
    "Involving the ES is sensible, but asking a senior to sign off a referral you are competent to make, because of the instruction rather than the lesion, is deferral; the ES’s role here is the policy."
   ]
  ],
  "tk": "When an employer’s instruction conflicts with patient safety, act for the patient first and raise the instruction with the next person in the chain who is not its source.",
  "r": [
   "8.1.1",
   "7.1",
   "8.2.3"
  ]
 },
 {
  "t": "consider",
  "d": "I",
  "g": "F",
  "a": "Unverified caller, safety alert",
  "k": "ABCDE",
  "s": "Five months into DFT, a receptionist passes you a call she is unsure about. The caller says she is Ms Hannah Price and asks for her mobile number and address to be changed and her next appointment time confirmed. She hesitated over the date of birth and gave the address the record lists as Hannah’s previous one. Hannah’s record carries an alert, added at her request a year ago: ‘Left abusive relationship. Share nothing with former partner.’ The caller is tearful, says it is her own information, and says she will complain if she is refused. Your ES is in surgery.",
  "o": [
   [
    "Hannah’s safety if her new details or appointment time reach the former partner she left.",
    "The most important: disclosure could put her at serious risk of harm, and the alert records her own wish (Std 4.2). It edges B because B matters only as the means of protecting her."
   ],
   [
    "Whether the caller’s identity can be confirmed, such as by calling back on the number on record.",
    "A very close second: verification is how you protect Hannah without shutting out the real patient, but it serves A rather than standing alone (Std 4.5)."
   ],
   [
    "The genuine patient’s right to update her own details and to know when she is next booked.",
    "A real interest that ranks below safety and verification: if the caller is Hannah, a short delay while her identity is checked costs her little (Std 2.3.10)."
   ],
   [
    "Making a record of the call and following the practice’s information-governance procedure.",
    "Important for the practice and any later safeguarding concern, but it follows from the decisions above rather than shaping them (Std 4.1)."
   ],
   [
    "The caller’s obvious distress and her stated intention to complain about the practice.",
    "Her distress deserves a kind response, but a possible complaint is the least weighty factor and cannot justify releasing protected information."
   ]
  ],
  "tk": "When a caller cannot be verified and the record carries a safety alert, protect the patient first and confirm identity before disclosing or changing anything.",
  "r": [
   "4.2",
   "4.5"
  ]
 }
];

const RW_5_4 = [
 {
  "t": "best3",
  "d": "T",
  "g": "T",
  "a": "Interpreter adding her own views",
  "k": "ABC",
  "s": "You are five months into DFT. Through a professional interpreter booked by the practice, you are discussing root canal treatment or extraction of a painful LL6 with Mr Tran, 58. You notice her replies to him run much longer than your questions. When you ask, she says she has told him extraction is cheaper and that she would have the tooth out herself. You have no way of checking what she says to him. Mr Tran has not yet signed anything. His daughter is waiting in reception, and the interpreting agency’s telephone line can supply another interpreter within ten minutes.",
  "o": [
   [
    "Pause and switch to the agency’s telephone interpreter, explaining to Mr Tran that you want the decision to be his own.",
    "She has already put her own view to him and you cannot check what she relays, so a neutral interpreter is the only way to make sure what he hears is what you say; one is available in ten minutes, so his care isn’t delayed (Std 2.1, 3.1)."
   ],
   [
    "Go back over both options with Mr Tran, including their costs, and ask him to explain in his own words what he understood.",
    "His view has already been shaped by an opinion that wasn’t yours, so consent can only be valid once you have re-explained the options and checked his understanding yourself (Std 3.1.1, 2.3)."
   ],
   [
    "Record in his notes what happened and how you dealt with it, and give feedback to the interpreting agency afterwards.",
    "The system part of the response: an accurate record of how consent was protected, and feedback so the agency can address it with the interpreter rather than the next patient meeting the same problem (Std 4.1)."
   ],
   [
    "Remind the interpreter, away from Mr Tran, to relay only what each of you says, and then carry on with the same interpreter.",
    "Correcting her at source is reasonable, but you have no way of checking that she follows the reminder, so the rest of the consent discussion still depends on someone who has already steered him."
   ],
   [
    "End the discussion and rebook Mr Tran with a different face-to-face interpreter, as consent today may be compromised.",
    "Safe for consent, but it leaves him in pain for longer when a neutral interpreter can join within ten minutes; deferral where an immediate fix is available sits below the keyed actions."
   ],
   [
    "Ask the agency’s manager to investigate the interpreter’s conduct before you continue with any more consent discussions.",
    "Feedback belongs in the response, but making a formal investigation a precondition of continuing delays his care; it is a mistimed version of the keyed record-and-feedback step."
   ],
   [
    "Ask Mr Tran’s daughter to join you and interpret instead, as she knows his wishes and he may feel more at ease.",
    "It sounds supportive, but family members are not neutral interpreters and may filter information or influence the decision, so a professional should be used for consent (safeguarding toolkit)."
   ],
   [
    "Continue with the plan for extraction, as Mr Tran had already said he preferred it, once he has signed the form.",
    "A signature is only evidence of consent; his preference was formed on biased information he received through the interpreter, so going ahead without re-explaining risks treatment without valid consent (Std 3.1)."
   ]
  ],
  "tk": "An interpreter must relay both voices faithfully: when you can’t trust what is being relayed, switch to a neutral interpreter, rebuild the patient’s understanding before consent, then record and feed back.",
  "r": [
   "3.1",
   "2.1",
   "2.3"
  ]
 },
 {
  "t": "rank",
  "d": "E",
  "g": "K",
  "a": "Finance-only LPA at home",
  "k": "ABCDE",
  "s": "You are eight months into DFT. At 4pm, with your nurse, you make a domiciliary visit to Mrs Hollis, 84, who is housebound with moderate dementia. Her lower denture is rubbing a small ulcer with no sign of infection, and you plan to ease the flange. When you reach for the denture she pushes your hand away and says, ‘Leave it.’ Her daughter shows you a registered lasting power of attorney for property and financial affairs and says, ‘Just do it, I’ll sign.’ She adds that her mother is usually much sharper in the mornings.",
  "o": [
   [
    "Leave the denture today, explain what the daughter’s LPA does not cover, and arrange to come back one morning to reassess.",
    "The problem isn’t urgent, Mrs Hollis has refused, and her capacity is likely to be better in the morning, so the MCA requires you to support her decision at a better time; a finance LPA gives the daughter no say over treatment (MCA principles 1–2; Std 3.1, 3.2.4). It edges B on timing."
   ],
   [
    "Explain the limits of the daughter’s LPA, then assess Mrs Hollis’s capacity now and, if she lacks it, act in her best interests.",
    "A close second: a sound MCA process that corrects the daughter’s view, but at the wrong time. For a non-urgent ulcer you should first consider whether she may regain capacity, and the stem tells you mornings are better, so assessing at 4pm risks wrongly concluding she lacks it."
   ],
   [
    "Phone your ES from the house to ask whether the daughter’s LPA allows you to go ahead with the adjustment today.",
    "Safe, since nothing is done meanwhile, but it outsources a question you should be able to answer (only a health and welfare LPA can cover treatment) and plans nothing for her ulcer or her capacity, so it sits below both MCA-based options."
   ],
   [
    "Leave the denture as it is and suggest that the daughter brings her mother to the practice for the adjustment soon.",
    "Passive and moving the problem: it respects today’s refusal but leaves the daughter believing her LPA lets her consent, and asks a housebound patient to travel when a return visit is possible."
   ],
   [
    "Ease the flange once the daughter has signed, as the change is minor, reversible and will help the ulcer heal.",
    "Despite its sensible-sounding reasons, the patient has refused, and a property and finance attorney cannot consent to treatment, so this would be treatment without valid consent (MCA ch 7; Std 3.1). It ranks lowest."
   ]
  ],
  "tk": "A finance-only LPA confers no authority over treatment, and a non-urgent decision should wait for the time when the patient is best able to make it herself.",
  "r": [
   "3.1",
   "3.2.4",
   "3.2"
  ]
 },
 {
  "t": "rank",
  "d": "P",
  "g": "H",
  "a": "Tremor you have been hiding",
  "k": "ABCDE",
  "s": "You are six months into DFT. After the morning list, your nurse quietly tells you that she has noticed your hands shaking when you place matrix bands and give inferior dental blocks. Three weeks ago your GP started you on sertraline for anxiety, which you have not mentioned at work. Your afternoon list starts at 2pm and includes an inferior dental block and root canal treatment on a lower molar. Your ES is free in the next surgery from 1:30, and your GP can see you in three days.",
  "o": [
   [
    "Tell your ES about the tremor and your new medication before 2pm, and follow his advice on today’s work until you see your GP.",
    "A possible risk to patients from your own health means consulting a suitably qualified colleague straight away and following their advice, rather than relying on your own view of the risk (Std 9.2.1–9.2.2). It edges B because he has the full picture and decides how today’s work is adapted."
   ],
   [
    "Tell your ES about the tremor before 2pm, and ask him to take your block and root canal patient so you can do the rest.",
    "A close second: it involves your ES before the list, but you set the adaptation yourself and leave out the likely cause, so the rest of your fine work this afternoon still rests on your own judgement of the risk (Std 9.2.2)."
   ],
   [
    "Book an urgent GP review and take extra care with fine work this afternoon until you have been seen and advised.",
    "Seeing your GP is right and needed, but working on this afternoon relies on your own judgement of a risk someone else has already noticed, when your ES could advise you before 2pm."
   ],
   [
    "Ask your nurse to tell you at once if she sees your hands shaking during this afternoon’s block and root canal.",
    "It adds a second pair of eyes but places responsibility for your fitness on a nurse and changes nothing before the risk arises; a partial measure below seeking proper advice."
   ],
   [
    "Report the tremor and your medication to the GDC today, so that it is on record before any patient is affected.",
    "It sounds responsible, but it is premature: GDC guidance expects you first to discuss your health with your supervisor and adapt your practice, and to self-refer only if you still believe your fitness to practise may be impaired. It also does nothing to protect this afternoon’s patients."
   ]
  ],
  "tk": "When your own health may affect patients, tell a suitably qualified colleague before the next patient and follow their advice; don’t rely on your own judgement of the risk.",
  "r": [
   "9.2.1",
   "9.2.2",
   "6.2.1"
  ]
 },
 {
  "t": "best3",
  "d": "I",
  "g": "C",
  "a": "Wrong patient X-rayed",
  "k": "ABC",
  "s": "You are four months into DFT. You call ‘Mr Clarke’ from the waiting room and take two bitewing radiographs. You then realise the man is Mr Daniel Clark, 62, who was waiting for the hygienist; your patient, Mr David Clarke, arrives a minute later. You did not check date of birth and address before the exposure, as the practice’s IR(ME)R procedure requires. Mr Daniel Clark is still in the building. The practice manager is the named contact for radiation incidents, and your ES is away until tomorrow.",
  "o": [
   [
    "Speak to Mr Daniel Clark before he leaves, apologise and explain what happened and that the dose was very low.",
    "Candour applies as soon as you realise: tell him, apologise personally for your error and explain the likely effects while he is still here (Std 1.3; candour guidance)."
   ],
   [
    "Report the incident to the practice manager today, following the practice’s IR(ME)R incident procedure.",
    "The practice’s named contact must hear about it promptly, because the employer investigates and decides whether external notification is needed (Std 1.5.4)."
   ],
   [
    "Make an accurate record in both men’s notes and reflect on the incident with your ES when they return tomorrow.",
    "Records must show what happened and which images belong to whom, and your ES can help you learn from the missed identity check (Std 4.1)."
   ],
   [
    "Wait until your ES returns tomorrow so that you can agree together how best to tell Mr Daniel Clark.",
    "A mistimed version of the candour step: support is welcome, but delaying the conversation when he is in the building now fails the duty to tell the patient as soon as possible."
   ],
   [
    "Notify the CQC yourself today, as exposing the wrong patient is a radiation incident that may need reporting.",
    "It sounds thorough but skips the practice’s procedure: the employer assesses the incident and decides on any notification to the regulator, so reporting it yourself first is premature escalation."
   ],
   [
    "Tell Mr Daniel Clark that the images were taken in error but the dose was tiny, so no follow-up is needed.",
    "A partial version of the candour step: it informs him but omits an apology and explanation and closes the matter before the incident has been reviewed."
   ],
   [
    "Remove the two images from the imaging software, as they have no clinical use for either man.",
    "Well meant but wrong: deleting records destroys the evidence the incident review needs; images are kept and correctly attributed, with an audit trail (Std 4.1)."
   ],
   [
    "Check Mr David Clarke’s identity fully and take his bitewings now, so that his own care is not delayed.",
    "Reasonable care for the correct patient, but it adds nothing to managing the incident and is not a priority over candour, reporting and recording."
   ]
  ],
  "tk": "After a wrong-patient exposure: tell and apologise straight away, report through the employer’s IR(ME)R route, and record and reflect.",
  "r": [
   "1.3",
   "1.5.4",
   "4.1"
  ]
 },
 {
  "t": "rank",
  "d": "T",
  "g": "M",
  "a": "Unrecorded warning in complaint reply",
  "k": "ABCDE",
  "s": "Nine months into DFT in a mixed practice, you placed a private composite veneer on UR1 for Mrs Rhiannon Price, 39. It chipped after five weeks, and at the review she mentioned that she bites her nails when stressed. Unhappy with the practice’s response, she has gone to the Dental Complaints Service, whose letter names you as the treating dentist, says she wants a refund and the cost of a new veneer elsewhere, and asks for a reply within ten days. The practice manager asks you to write today that the chip was caused by nail-biting she had been warned about. Your notes record no such warning. Your ES is in tomorrow.",
  "o": [
   [
    "Tell the manager you can’t cite an unrecorded warning, and get advice from your defence organisation before replying from your notes.",
    "It refuses to state something the records don’t support (Std 1.3.1). Because she is now asking you for money, this is a possible claim, which you should notify to your indemnity provider promptly and take its advice on (Std 1.8.2). That puts it just above B."
   ],
   [
    "Tell the manager you can’t cite an unrecorded warning, and draft a reply from your notes together with your ES tomorrow.",
    "Just as honest as A and well supported, and ten days leaves time. It falls just short because a request for a refund and remedial costs is exactly when your indemnity provider’s advice, and not only your ES’s, should shape what you write."
   ],
   [
    "Reply today from your notes, setting out the treatment and the review, and that her nail-biting may have contributed to the chip.",
    "Honest and owned, so it sits above D and E, but it rushes a reply to an external body about a possible claim without advice, and leads with a cause that points at the patient rather than her concerns (Std 5.2.1)."
   ],
   [
    "Ask the practice manager to reply for the practice, as she handled the first stage, and send her a copy of your clinical notes.",
    "This moves the problem: you are the dentist named, and handing the reply to the manager who wanted to cite an unrecorded warning risks an inaccurate account going out about your care."
   ],
   [
    "Phone Mrs Price to offer a free replacement veneer, on the understanding that she then withdraws her complaint to the service.",
    "It sounds like a fair remedy (Std 5.3.9), but making it conditional on withdrawal pressures her to give up her right to complain (Std 5.2) and sidesteps the process, so it ranks lowest."
   ]
  ],
  "tk": "When a complaint about your own care reaches an external body and seeks money, reply only with what the records support and get indemnity advice first; never make a remedy conditional on withdrawing the complaint.",
  "r": [
   "1.3.1",
   "1.8.2",
   "5.2.1"
  ]
 },
 {
  "t": "consider",
  "d": "E",
  "g": "S",
  "a": "Unverified caller, child protection plan",
  "k": "ABCDE",
  "s": "Seven months into DFT, you take a call from a withheld number. The caller says she is Amara Bell, the school nurse for Kai Doyle, 7, who is on a child protection plan for neglect. Before a core group meeting tomorrow morning, she asks whether Kai has seen a dentist and what was found. Three weeks ago you found six carious teeth, and his mother has since missed two follow-up appointments. You have not spoken to this nurse before. The practice safeguarding lead is in today.",
  "o": [
   [
    "Whether the caller really is Kai’s school nurse, which you could check by calling back via the school’s main number",
    "This comes ahead of B only because the number is withheld and you have never spoken to her. Until her identity is confirmed, nothing can safely be shared, and there is time to call back before tomorrow’s meeting."
   ],
   [
    "How far Kai’s untreated decay and the two missed follow-ups bear on the neglect that the plan is addressing",
    "This is the substance of the decision. Persistent failure to get a child’s caries treated is a recognised sign of neglect (NICE NG76; Std 8.5), so Kai’s welfare is why sharing is justified once the caller is confirmed."
   ],
   [
    "Which details the core group actually needs, so that you share what is relevant to the plan and nothing more",
    "This follows from B. Share the dental findings and attendance that matter to the plan and nothing more (Std 4.2). It shapes how much you share rather than whether you share."
   ],
   [
    "Whether the safeguarding lead knows about the request, and how you will record what was shared and why",
    "This is important process that protects Kai and you (Std 4.3.5, 8.5.2). But it supports the decision rather than making it, so it sits below the three that do."
   ],
   [
    "Whether Kai’s mother should be told that the practice is sharing information with the school nurse",
    "This is relevant to being open with the family. But consent isn’t needed to share within a child protection plan, and telling her is a matter for the lead and only where safe, so it matters least here."
   ]
  ],
  "tk": "Sharing relevant information with a child protection team is expected. First make sure who you are talking to, then share only what the plan needs and record why.",
  "r": [
   "8.5.2",
   "4.3",
   "4.3.5"
  ]
 },
 {
  "t": "consider",
  "d": "I",
  "g": "I",
  "a": "Paid brand ambassador offer",
  "k": "ABCDE",
  "s": "Ten months into DFT, at a sponsored study day, a representative from a toothbrush company offers you £250 a month and free stock to become a brand ambassador. You would recommend their electric toothbrush to patients, hand out samples carrying a personal discount code that tracks purchases back to you, and post about the brush online. Your DFT post is NHS-only, and your educational supervisor is also at the study day. The representative would like your answer before the day ends.",
  "o": [
   [
    "Whether you would still recommend the brush only to patients for whom it is clinically the right choice",
    "Patients’ interests must outrank any payment (Std 1.7.1). If the fee could shape which patients are steered towards the brush, the arrangement fails here, before any other question arises, which puts this just ahead of B."
   ],
   [
    "Whether patients would realise you are paid when you hand them a sample carrying your own discount code",
    "The tracked code makes each sample a sale credited to you, and patients are entitled to know about that interest (Std 1.3.1, 1.7.5). It is about their trust rather than their clinical care, so it sits just below A."
   ],
   [
    "Whether your DFT contract and practice policy allow it, and the need to declare the offer to your ES",
    "This matters before you agree, and your ES is at hand today. But it protects your training post and the practice more than it protects patients, so it sits below A and B."
   ],
   [
    "Whether the claims you would make about the brush in your online posts are accurate and backed by evidence",
    "This matters if you go ahead: public claims must be accurate and not misleading (Std 1.3.3; GDC social media guidance). But it is about the posts rather than the patients you treat."
   ],
   [
    "How much the £250 a month and a higher online profile would mean to you at this stage of your career",
    "A legitimate personal factor. But your own income and profile come below every patient and probity consideration (Std 1.7.1), so this matters least."
   ]
  ],
  "tk": "When a commercial offer touches patient care, first ask whether clinical need and patients’ trust stay intact. Your own gain comes last.",
  "r": [
   "1.7.1",
   "1.7.5",
   "1.3.3"
  ]
 },
 {
  "t": "best3",
  "d": "P",
  "g": "M",
  "a": "ADHD and missed-appointment discharge",
  "k": "ABC",
  "s": "Eleven months into DFT, you are treating Mr Callum Reid, 27, whose medical history records ADHD. His current course includes a deep, symptomatic LL6. He has arrived over 20 minutes late three times and missed one appointment. The practice manager asks you to agree today to discharge him under the practice’s ‘two failed appointments’ policy. Mr Reid has told you he finds timekeeping hard and that he only receives postal reminders; the booking system could send him texts, but they have never been switched on. He is booked with you next week.",
  "o": [
   [
    "Ask the manager to hold the discharge, explaining that the practice must first make reasonable adjustments for his ADHD",
    "This deals with the immediate problem. Discharging a disabled patient without first trying reasonable adjustments would breach the practice’s equality duty (Std 1.6.2–1.6.3), and he still needs active treatment (Std 1.7.8)."
   ],
   [
    "Agree adjustments with Mr Reid, such as text reminders and a regular appointment time he finds easier to keep",
    "This addresses the person. Agreeing practical changes with him, including the text reminders that are already available, tackles the reason his appointments are going wrong."
   ],
   [
    "Record the agreed adjustments on his notes and booking record so that every member of staff applies them",
    "This is the system fix. Adjustments only work if reception and every clinician apply them, so they must be recorded where bookings are actually made."
   ],
   [
    "Book him double-length appointments so that a late arrival still leaves enough time to complete his treatment",
    "Well-meant and close to B. But it uses extra clinical time without asking what would help him and does nothing about why he is late, which agreed adjustments do."
   ],
   [
    "Ask Mr Reid for a letter from his GP confirming his ADHD before agreeing to any changes to his care",
    "This puts a barrier in his way. His ADHD is already recorded and he has explained the difficulty, so demanding evidence first delays adjustments the practice should make now."
   ],
   [
    "Agree to the discharge but give him written details of urgent dental care and of other local practices",
    "It sounds responsible because it signposts urgent care. But it ends care for a disabled patient with a symptomatic tooth without trying adjustments (Std 1.6.3, 1.7.8), so it is the weakest option."
   ],
   [
    "Reassure Mr Reid that he will not be discharged from the practice, whatever happens with future appointments",
    "A promise made before the facts are known. The adjustments may not work, and an unconditional assurance overrides the practice’s policy rather than adapting it."
   ],
   [
    "Make the LL6 the priority at next week’s visit so it is treated before any decision on discharge is made",
    "Clinically sensible, but he is already booked, and this leaves discharge as the likely outcome. It treats the tooth without removing the barrier to his care."
   ]
  ],
  "tk": "Before applying a missed-appointment policy to a disabled patient, make reasonable adjustments, agree them with the patient and make sure the whole team applies them.",
  "r": [
   "1.6.3",
   "1.7.8",
   "2.1"
  ]
 }
];

const Q = [...RW_1_1, ...RW_1_2, ...RW_1_3, ...RW_1_4, ...RW_2_1, ...RW_2_2, ...RW_2_3, ...RW_2_4, ...RW_3_1, ...RW_3_2, ...RW_3_3, ...RW_3_4, ...RW_4_1, ...RW_4_2, ...RW_4_3, ...RW_4_4, ...RW_5_1, ...RW_5_2, ...RW_5_3, ...RW_5_4];

// Themes for Paper 1 and Paper 2, in question order.
const G12 = "IMTPCTNMFHWSKPTKRFPWKIMIMRIPTNHK" + "WISPNTKHHIWMRTMWCKFRPMIWITKWRPKC";
Q.forEach((q, i) => { if (!q.g) q.g = G12[i]; });
Q.forEach((q, i) => { q.p = Math.floor(i / 32) + 1; q.n = i + 1; });

// Fixed per-question shuffle of the displayed options; each key is remapped to the displayed letters.
(function(){
  const REF = /(\b(?:of|than|out|unlike|like|below|above|over|beats?|outranks?|edges?|and|or|nor|neither|which|because|to|in|with|as|from)\s+)([A-H])(?=[\s,.;:)’'\-]|$)|(^|[\s(])([A-H])(?=\s+(?:and|or|nor|because|does|do|is|would|ranks?|sits?|comes?|but|edges|beats|outranks|keeps|leaves|wins|addresses|depends|matters|covers|starts|gets|gives|takes|offers|puts|deals|fixes|on)\b)|\(([A-H])\)/g;
  function rng(seed){ let x = (seed >>> 0) || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  Q.forEach((q, qi) => {
    const rnd = rng(((qi + 11) * 2654435761) >>> 0);
    for (let w = 0; w < 5; w++) rnd();
    const order = q.o.map((_, j) => j);
    for (let j = order.length - 1; j > 0; j--) { const r = Math.floor(rnd() * (j + 1)); [order[j], order[r]] = [order[r], order[j]]; }
    const toNew = {}; order.forEach((old, pos) => toNew[old] = pos);
    // Justifications sometimes compare options by letter ("it edges out B"); point those at the displayed letters.
    const mapL = ch => L[toNew[L.indexOf(ch)]] || ch;
    q.o.forEach(o => { o[1] = o[1].replace(REF, (m, p1, l1, p2, l2, l3) => l1 ? p1 + mapL(l1) : l2 ? p2 + mapL(l2) : "(" + mapL(l3) + ")"); });
    let k = q.k.split("").map(ch => L[toNew[L.indexOf(ch)]]);
    if (q.t === "best3") k.sort();
    q.k = k.join("");
    q.o = order.map(old => q.o[old]);
  });
})();
