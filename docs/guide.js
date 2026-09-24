// The pattern guide: how the test works, the logic behind the keys, and a playbook for each theme.
const GUIDE = [
{id:"format", title:"How the test works", html:`
<p class="lead">The DFT SJT is 100% of your national ranking for Dental Foundation Training in England, Wales and Northern Ireland. Scotland recruits separately.</p>
<table class="gtable"><tbody>
<tr><th>Length</th><td>56 questions in 105 minutes (about 1 min 52 s each). 50 are scored; 6 are unmarked pilots you can’t identify.</td></tr>
<tr><th>Your role</th><td>A Foundation Dentist in a training practice, with an Educational Supervisor (ES) and a Training Programme Director (TPD).</td></tr>
<tr><th>Ranking items</th><td>Rank 5 options from most to least appropriate. Usually actions; sometimes considerations, ranked by importance.</td></tr>
<tr><th>Best-three items</th><td>Choose the 3 most appropriate of 8 options.</td></tr>
<tr><th>Mix</th><td>About two-thirds ranking in live papers.</td></tr>
<tr><th>Negative marking</th><td>None. A blank scores 0.</td></tr>
</tbody></table>
<h4>The four domains</h4>
<ol>
<li><b>Professional integrity:</b> honesty, taking responsibility, putting patients first, challenging wrongdoing.</li>
<li><b>Resilience and coping with pressure:</b> prioritising, managing workload and personal pressures, asking for help.</li>
<li><b>Empathy and communication:</b> seeing the other person’s view, being patient-centred, explaining clearly.</li>
<li><b>Working as part of a team:</b> supporting colleagues, resolving conflict, respecting roles.</li>
</ol>
<h4>Why the marking matters</h4>
<p>In a ranking item each option is worth 4 marks. You lose 1 mark for every place it sits from the keyed position, up to a maximum of 20 per item.</p>
<table class="gtable"><thead><tr><th>Your ranking</th><th>Marks out of 20</th></tr></thead><tbody>
<tr><td>Any complete ranking, even fully reversed</td><td>at least 8</td></tr>
<tr><td>Random order</td><td>about 12 on average</td></tr>
<tr><td>Top option correct</td><td>at least 12</td></tr>
<tr><td>Top <b>and</b> bottom correct</td><td>at least 16</td></tr>
<tr><td>One adjacent pair swapped</td><td>18</td></tr>
</tbody></table>
<p>In best-three items each correct pick scores 4, up to 12. <b>Getting the best and worst options right is worth most of the marks</b>, so secure the ends first and don’t agonise over the middle. Never leave a ranking blank.</p>`},

{id:"priorities", title:"The priority order", html:`
<p class="lead">When two sensible actions compete, the one that serves the higher priority ranks above. This order explains nearly every official key.</p>
<ol class="steps">
<li><b>Patient safety:</b> stop harm happening, or getting worse, right now.</li>
<li><b>Patient autonomy and dignity:</b> consent, informed choice, being listened to.</li>
<li><b>Honesty and integrity:</b> candour, accurate records, no concealment or collusion.</li>
<li><b>Confidentiality:</b> share only with consent or clear justification.</li>
<li><b>The team:</b> supporting colleagues, resolving conflict fairly, respecting roles.</li>
<li><b>You:</b> your learning, development and wellbeing.</li>
<li><b>The practice’s convenience:</b> targets, income, keeping things smooth.</li>
</ol>
<h4>Where the order bends</h4>
<ul>
<li><b>A competent patient’s choice can beat your view of what’s safest.</b> They may refuse treatment, but they can’t require irreversible treatment you believe is against their interests.</li>
<li><b>Confidentiality gives way to serious risk, safeguarding or the law,</b> but not to a relative’s wishes, a minor police query or convenience.</li>
<li><b>Your own health moves up when it affects patients.</b> Working while unwell or infectious is a safety issue.</li>
<li><b>Supporting a colleague can top the list when no patient is at risk.</b></li>
<li><b>Honesty is never traded away</b> for loyalty, money or a colleague’s secret.</li>
</ul>`},

{id:"ladder", title:"The escalation ladder", html:`
<p class="lead">The keys reward going up one rung at a time, starting with the person themselves, unless a patient is at immediate risk.</p>
<ol class="ladder">
<li><span>0</span><div><b>Make patients safe now</b>: stop, pause, get help. This runs alongside every other step.</div></li>
<li><span>1</span><div><b>The person, privately and directly.</b> Explain why it matters, and give them a chance to put it right or self-report.</div></li>
<li><span>2</span><div><b>Inside the practice:</b> your ES for clinical and learning issues, the practice manager for staff matters, the owner for governance, or the relevant lead (safeguarding, infection control).</div></li>
<li><span>3</span><div><b>The training structure:</b> your TPD, or the Dental Dean, when it’s about training or personal circumstances, or when your ES is the problem.</div></li>
<li><span>4</span><div><b>External bodies:</b> the commissioner, the CQC or equivalent, social care, the police.</div></li>
<li><span>5</span><div><b>The GDC:</b> when local routes have failed, or straight away for inherently serious matters such as dishonesty, violence, illegal practice or a cover-up.</div></li>
</ol>
<p>Skip the conversation with the person only when it would endanger patients, tip off a wrongdoer or put you at risk. Advice lines, such as your defence organisation or the BDA, are useful at any point. But advice isn’t action, so these options tend to sit in the middle.</p>
<h4>Who to go to for what</h4>
<table class="gtable"><thead><tr><th>Issue</th><th>Go first to</th></tr></thead><tbody>
<tr><td>Your competence, a clinical question, learning, workload</td><td>Your ES</td></tr>
<tr><td>Personal circumstances affecting training; a problem <i>with</i> your ES</td><td>Your TPD</td></tr>
<tr><td>A staff member’s conduct, rotas, operations (after speaking to them)</td><td>The practice manager</td></tr>
<tr><td>Governance, the NHS contract, pressure coming from the practice manager</td><td>The practice owner</td></tr>
<tr><td>A child or vulnerable adult at risk</td><td>The practice safeguarding lead (999 if in immediate danger)</td></tr>
<tr><td>Your own legal position after an incident</td><td>Your defence organisation</td></tr>
</tbody></table>`},

{id:"traits", title:"What top and bottom options look like", html:`
<div class="gcols">
<div><h4>Push an option up</h4><ol>
<li>You deal with it yourself, directly and privately.</li>
<li>You find out more first: feelings, causes, specifics.</li>
<li>You take ownership of your patient, your error, your learning.</li>
<li>You’re honest and open, even when it’s uncomfortable.</li>
<li>You act on safety risks urgently.</li>
<li>You involve the <i>right</i> senior at the right time.</li>
<li>You give a colleague the chance to put it right.</li>
<li>You add a practice-wide fix.</li>
</ol></div>
<div><h4>Push an option down</h4><ol>
<li>Doing nothing, or waiting to see.</li>
<li>Colluding, concealing, going along with it.</li>
<li>Confronting or blaming in public, threatening.</li>
<li>Being dismissive or judgemental to a patient.</li>
<li>Workarounds that bypass the system or move the problem.</li>
<li>Handing <i>your</i> problem to someone else.</li>
<li>Delaying action on a serious finding.</li>
<li>Putting your own image or comfort at the centre.</li>
<li>Escalating before the local route has been tried.</li>
<li>Working beyond your competence.</li>
</ol></div>
</div>
<p><b>Usually last:</b> whatever harms or abandons a patient, conceals something, or is dishonest.<br><b>Usually middle:</b> getting advice, only documenting, only reflecting, asking peers, giving up your own time.</p>`},

{id:"traps", title:"Traps and reverse traps", html:`
<h4>Options that look good but rank low</h4>
<table class="gtable"><thead><tr><th>Option</th><th>Why it’s lower than it looks</th></tr></thead><tbody>
<tr><td>Apologising before you know what’s wrong</td><td>Explore first, then apologise for what actually happened.</td></tr>
<tr><td>Going to the manager before speaking to the colleague</td><td>It skips local resolution and damages trust.</td></tr>
<tr><td>Reporting a senior before they’ve had a chance to reconsider</td><td>Premature, unless the harm is serious and ongoing.</td></tr>
<tr><td>Phoning your defence organisation</td><td>You get advice, but nothing is done. Usually middle.</td></tr>
<tr><td>Staying late, or doing a colleague’s work</td><td>Fatigue, and the cause isn’t fixed.</td></tr>
<tr><td>Asking for longer appointments or a different nurse</td><td>It moves the problem instead of solving it.</td></tr>
<tr><td>“Monitor it and report if it happens again”</td><td>It leaves the current problem unaddressed.</td></tr>
<tr><td>Reflecting or informing your ES in an “immediate” question</td><td>Right eventually, but safety steps come first.</td></tr>
<tr><td>A vague letter, or one that leaves facts out</td><td>Still dishonest.</td></tr>
<tr><td>Deleting or “tidying” records</td><td>Records are corrected with an audit trail, never removed.</td></tr>
<tr><td>A disclaimer or form as the fix for a safety gap</td><td>Paperwork doesn’t make an unsafe situation safe.</td></tr>
</tbody></table>
<h4>Options that feel harsh but rank high</h4>
<ul>
<li>Telling a patient honestly that a finding <i>may</i> be serious, together with an urgent referral.</li>
<li>Telling the employer when a colleague won’t disclose something that puts patients at risk.</li>
<li>Stopping a procedure because the patient seems distressed.</li>
<li>Declining a request for treatment that isn’t in the patient’s interests, and explaining the alternatives.</li>
<li>Politely refusing a senior’s instruction you believe is wrong.</li>
</ul>`},

{id:"technique", title:"Technique", html:`
<h4>Ranking items</h4>
<ol>
<li>Read the instruction line first. Is it about actions or considerations? Does it say “immediate”?</li>
<li>Name the principle at stake.</li>
<li>Predict the ideal response before reading the options.</li>
<li>Find the best option, then the worst.</li>
<li>Order the middle three using the priority order and the ladder. If you’re stuck, direct action beats seeking advice, which beats passivity.</li>
<li>Judge each option on its own, as if it were the only thing you’d do. It isn’t a sequence of steps.</li>
<li>Commit and move on. A near miss still scores.</li>
</ol>
<h4>Best-three items</h4>
<ul>
<li>Eliminate first: three or four options are usually clearly poor.</li>
<li>Choose three that cover different ground: the immediate problem, the person’s needs, and a follow-up or root-cause fix.</li>
<li>When two options do the same thing, usually only one is keyed.</li>
</ul>
<h4>Considerations items</h4>
<p>The affected person’s immediate needs → facts relevant to the decision now → general duties → your own feelings or reputation → anything tangential.</p>
<h4>Thinking errors that cost marks</h4>
<ul>
<li>Answering as a student or as a senior partner, instead of an FD at your stage.</li>
<li>Adding facts that aren’t in the scenario.</li>
<li>Picking what you <i>would</i> do rather than what you <i>should</i> do.</li>
<li>Rewarding an action that’s right but not needed yet.</li>
</ul>`},

{id:"checklist", title:"Quick checklist", html:`
<ol class="steps">
<li><b>Is anyone at risk right now?</b> The safety action goes first.</li>
<li><b>Whose problem is this?</b> If it’s yours, own it.</li>
<li><b>Do I know enough?</b> If not, explore before you act or apologise.</li>
<li><b>Am I being asked to hide, bend or ignore something?</b> Never collude.</li>
<li><b>Have I spoken to the person directly and privately?</b> Do that before escalating, unless it’s unsafe.</li>
<li><b>Who is the right next person?</b> ES, TPD, practice manager, owner or lead.</li>
<li><b>Does this fix the cause, not just the incident?</b></li>
</ol>
<p><b>Rule of thumb:</b> picture the action written into the notes and read by the patient, your ES and the GDC. The action all three would be comfortable reading usually ranks highest.</p>`}
];

// A playbook for each theme: what usually ranks high, what usually ranks low, and the nuance.
const PLAYBOOKS = {
C:{high:["Make the patient safe and limit harm","Tell them promptly, plainly and specifically, with an apology (an apology isn’t an admission of liability)","Put it right, or arrange for someone who can","Write accurate notes, with late entries dated and nothing altered","Report it as an incident and check whether anyone else is affected","Inform your ES and reflect"],
   low:["Concealing it, or waiting to see if they notice","Altering, deleting or tidying records","Blaming a colleague, or asking the nurse to keep quiet","Calling your defence organisation before telling the patient"],
   note:"In “immediate” questions, urgent safety steps come before informing your ES or reflecting."},
R:{high:["Act on any immediate risk, discreetly","Speak to the colleague privately and directly first","Give them the chance to correct things or self-report","If it’s repeated or serious, go up one rung: ES, practice manager, owner or lead","Make factual notes, and think about which patients were affected"],
   low:["Staying silent, covering for them, or just “keeping an eye”","Confronting them in public, gossiping or posting in group chats","Covert workarounds, such as asking the nurse to swap items","Going to the GDC before any local route"],
   note:"You don’t need proof to raise a concern, and the duty overrides loyalty. If a quiet word has already failed, don’t repeat it; move up a rung."},
K:{high:["Presume capacity and support the decision (simpler explanations, visual aids)","Explore their reasons before you advise","Explain risks, benefits, alternatives (including doing nothing) and costs","Respect a competent decision and record it","Under-16s: assess Gillick competence","Lacking capacity: follow the best-interests process, and inform an LPA attorney and work with them"],
   low:["Pressure, coercion or scaring them","Carrying on after a refusal","Accepting consent from someone without legal authority","Treating an unwise choice as incapacity","Giving irreversible treatment just because it was asked for, or overriding a valid attorney"],
   note:"Autonomy lets patients refuse. It doesn’t oblige you to provide treatment you believe is against their interests; offer a second opinion instead."},
F:{high:["No disclosure without consent, and that includes confirming attendance and costs","A kind refusal, plus a way forward (offer to pass on a message)","A private word with whoever breached it, plus a system fix","Get posts taken down fast","For disclosure decisions: consent, then the law, then a serious public interest"],
   low:["Public replies to reviews or posts","Screenshots or anything that spreads the information further","Disclosing to keep the peace or save time","Proof of identity treated as a right to information"],
   note:"Confidentiality gives way to safeguarding, serious crime or a legal requirement, and then only the minimum necessary is shared."},
S:{high:["Meet the immediate clinical need","Record findings and what was said, objectively","Involve the practice safeguarding lead promptly","999 if someone is in immediate danger","With adults who have capacity: support them and seek their agreement"],
   low:["Investigating yourself, or examining beyond your clinical remit","Confronting the suspected abuser","Waiting for proof, or for the next appointment","Promising secrecy","Sharing information outside the proper process"],
   note:"A child’s welfare is paramount. For competent adults, consent is central unless someone is in immediate danger or others are at risk."},
W:{high:["Don’t start what you can’t do safely","Get on-site supervision, or defer the complex part","Work with a trained nurse; look after them if they’re unwell","Stop using equipment that has failed a test","Stay within your scope, including prescribing","Be honest with the patient if you need to rebook"],
   low:["Going ahead on theory, or “the ES said I’d be fine”","Working without a second person when nothing about the situation is exceptional","Untrained helpers, or “re-test and carry on”","Disclaimers presented as a fix"],
   note:"Refusing all new, supervised work is wrong too. DFT exists to extend your competence safely."},
M:{high:["Pause, acknowledge feelings, explore before fixing","Examine and find the cause","Give an honest explanation and agree a plan","Use a professional interpreter for anything important","Take criticism offline and treat it as a complaint"],
   low:["Dismissive or lecturing responses","Defensiveness, or offering the complaints leaflet as a first move","Handing the conversation to someone else","“You’d have to pay privately for better”","Threats, or public replies"],
   note:"Stay calm with angry patients and protect everyone’s dignity. Threatening the police is only right if there’s violence."},
P:{high:["Clinical urgency first; send red flags to hospital","Tell waiting patients, apologise and offer choices","Raise workload directly with whoever is causing it","Involve your ES in problems built into the system","Make realistic plans"],
   low:["Cutting clinical corners to catch up","Quietly withdrawing help, so patients lose out","Moving your load onto colleagues","Cancelling everything, which is disproportionate"],
   note:"Routinely working through lunch or staying late is “proactive but”: it sits in the middle, above secrecy or corner-cutting."},
T:{high:["A private, direct conversation, assuming good intent","Explain why it matters, and offer support or training","A practice-meeting fix","Accept feedback and ask for specifics","Own your behaviour and repair it","Challenge discrimination, whoever it comes from"],
   low:["Public correction or threats","Trying to find out who complained","Swapping staff to avoid the issue","Gossip, blame, or standing by"],
   note:"Disciplining staff isn’t an FD’s role. Support colleagues and point them to the proper routes."},
H:{high:["Tell your TPD or ES early","Get occupational health advice rather than judging your own risk","Don’t work if you’re infectious or impaired","Follow the sharps policy straight away","A colleague at risk: ask directly, get help today, be honest about the limits of confidentiality"],
   low:["Soldiering on, or hiding it","Assessing your own risk","Minimising someone’s distress","Delaying help until later in the week"],
   note:"Looking after your health is part of patient safety, not a sign of weakness."},
I:{high:["Refuse to collude, and explain why calmly","Honest, factual letters, records and references","Decline shortcuts and offer a proper alternative","Encourage self-correction before escalating","Record unusual requests in the notes"],
   low:["Backdating or fabricating anything","Vague wording or omissions meant to mislead","Accepting a false sign-off, even “with a note”","Being signed in by someone else, or fake reviews"],
   note:"Dishonesty is the category most likely to end a career, even when the underlying issue was minor."},
N:{high:["Present every option, including NHS care, neutrally","A written plan showing costs and NHS or private status","Let the patient’s values decide","Set recalls and claims by clinical need and the rules","Challenge target pressure calmly; check the rules if unsure"],
   low:["Saying a treatment is only available privately when it isn’t","Pressure, or assuming what they can afford","Splitting claims, or complying to hit targets","Reporting before you’ve discussed it"],
   note:"The claims you submit are your responsibility, whoever asked you to make them."}
};
