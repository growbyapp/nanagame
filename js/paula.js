/* HEY, NANA - Room 707: Paula's episode and her nail bar minigame. */
window.NG = window.NG || {};
(function () {
  'use strict';

  function sc(id) { return { type: 'scene', id: id }; }
  function mu(id) { return { type: 'music', id: id }; }
  function le(text) { return { type: 'letter', text: text }; }
  function na(text) { return { type: 'narrate', text: text }; }
  function P(expr, text) { return { type: 'say', who: 'paula', expr: expr, text: text, side: 'left' }; }
  function S(who, expr, text) { return { type: 'say', who: who, expr: expr, text: text, side: 'right' }; }
  function ch(prompt, options, timer) { var c = { type: 'choice', prompt: prompt, options: options }; if (timer) c.timer = timer; return c; }
  function lb(name) { return { type: 'label', name: name }; }
  function ju(to, cond) { var j = { type: 'jump', to: to }; if (cond) j.if = cond; return j; }
  function qt(prompt, seconds, taps, success, fail) { return { type: 'qte', prompt: prompt, seconds: seconds, taps: taps, success: success, fail: fail }; }
  function mi(id) { return { type: 'minigame', id: id }; }
  function end(id) { return { type: 'wfend', id: id }; }

  var episode = {
    id: 'paula-707', title: 'The Girl With the Nail Kit',
    tagline: 'One nail tech. One black cat. Every volume memorised.',
    premise: 'Paula, a 23-year-old nail tech from Spain who has read NANA more times than is medically advised, falls asleep on volume one and wakes up on the seventh floor.',
    cast: ['paula', 'nana', 'hachi', 'samu'], scene: 'room-707',
    endings: {
      regular: { title: 'Regular Customer', caption: 'Room 707 now has an appointment book. Nana claims she never asked for one. She is booked every second Tuesday.' },
      home: { title: 'Third Glass', caption: 'Paula went home with her boyfriend, her cat and a strawberry glass nobody can explain to customs.' },
      told: { title: 'The Spoiler Clause', caption: 'She said one sentence too many and woke up on her sofa. On the shelf, volume one had a new page.' },
      yuki: { title: 'Yuki, Manager of Blast', caption: 'The cat signed the contract. Yasu has reviewed it and says it is, regrettably, airtight.' }
    },
    steps: [
      sc('hometown'), mu('room'),
      le('Hey, Nana.\n\nYou don\'t know me. That is the first problem.\n\nMy name is Paula. I\'m twenty-three, I live in Spain, and I make nails for a living. I was partly raised in Romania, beside a sea that is not actually black, which I still feel was false advertising.\n\nI have read your whole story so many times that the spine gave up. My boyfriend says I talk about you the way other people talk about family.\n\nLast night I fell asleep on volume one with my cat on my chest.\n\nI would like to explain what happened next, but I still do not fully understand it.'),
      sc('tokyo-night'),
      na('She wakes up on cold concrete. Stairwell. Seven flights of it. There is a nail kit in her lap and a very annoyed black cat sitting on her shins.'),
      P('shock', 'Yuki. Yuki, this is not our stairs. Why does this smell like cigarettes and someone else\'s curry?'),
      S('yuki', 'neutral', 'Mrrp.'),
      sc('room-707'),
      na('There is a door in front of her. It has a number on it. She has drawn this number on a notebook. She has had this number on a phone case.'),
      P('shock', 'No. No no no. Madre mía. Doamne. Seven. Zero. Seven.'),
      na('The door opens, and a girl with an armful of laundry looks out, then down.'),
      S('hachi', 'shock', 'Waa! Are you okay? Did you fall? Did you come about the gas bill? Is that a CAT?'),
      ch('It is her. It is really her. She has a sock on her shoulder. You have one chance to act like a normal adult.', [
        { label: 'Stay calm. Say a polite, ordinary hello.', rel: { hachi: 1 }, reply: [
          P('happy', 'Hello. Good evening. I am a normal woman and I am not crying.'),
          S('hachi', 'sad', 'But you are crying, though.'),
          P('sad', 'I know. It\'s a lot. Your sock is so real.')
        ] },
        { label: 'Scream her name and hug her immediately.', rel: { hachi: 2 }, flag: 'hugged', remember: 'Hachi will remember the hug. So will her ribs.', reply: [
          P('happy', 'HACHIIIII! You\'re so small! You smell like fabric softener! I love you! Sorry! I love you!'),
          S('hachi', 'happy', 'Oh! Okay! I love you too! Who are we?')
        ] },
        { label: '[Say nothing. Faint slightly.]', silent: true, reply: [
          na('She slides gently down the door frame. The cat steps over her and walks into the apartment as if it has been paying rent.')
        ] }
      ], 8),
      S('hachi', 'happy', 'You know my nickname? Did Nana send you? She never tells me anything! Come in, I just made too much rice!'),
      P('happy', 'I\'m Paula. I do nails. I\'ll explain. I can\'t explain. Can I just stand in your kitchen for one minute?'),
      na('She stands in the kitchen for one minute. Two glasses are drying by the sink. Strawberries all over them. She has to hold the counter.'),
      S('hachi', 'happy', 'Aren\'t they cute? We got them together. Nana says they\'re ridiculous, but she only uses that one.'),
      P('sad', 'I know. I know she does.'),

      lb('nana_home'), mu('tension'),
      na('Keys in the door. Boots. Somebody who does not take them off straight away.'),
      S('nana', 'neutral', 'Hachi. There\'s a stranger crying in our kitchen and a cat on my guitar case.'),
      S('hachi', 'happy', 'This is Paula! She came all the way from Spain! She does nails! I think she might be fate!'),
      S('nana', 'smirk', 'You said that about the guy who fixed the water heater.'),
      P('shock', 'Hi. Hello. I\'m. You. Your jacket. Sorry. I\'ve practised this in the mirror and it went better.'),
      S('nana', 'neutral', 'You a fan?'),
      ch('Nana Osaki is looking straight at you, and she does not blink as much as you\'d think.', [
        { label: '"Honestly? You\'re the reason I got through some bad years."', rel: { nana: 2 }, flag: 'honest_fan', reply: [
          S('nana', 'neutral', '...That\'s a heavy thing to say to someone with a bag of groceries.'),
          P('sad', 'I know. Sorry. It\'s true, though.'),
          S('nana', 'smirk', 'Put the milk away, Spain. Then we\'ll see.')
        ] },
        { label: '"A fan? No. Who? I\'m here about your cuticles."', rel: { nana: 1, hachi: 1 }, flag: 'cuticles', reply: [
          S('nana', 'smirk', 'My cuticles.'),
          P('smirk', 'They\'re a cry for help. Whoever did that black polish should be in prison.'),
          S('nana', 'happy', 'Hah! I did it myself, on a train. All right. You can stay till the rice is gone.')
        ] },
        { label: 'Recite her entire setlist, in order, from memory.', rel: { nana: -1, hachi: 1 }, reply: [
          S('nana', 'shock', 'We haven\'t played that one yet.'),
          P('shock', 'Ah. Okay. Forget that. Forget everything. Lovely weather.')
        ] }
      ]),
      S('yuki', 'smirk', 'Mrrow.'),
      na('The black cat has climbed from the guitar case to the draining board. She is looking at the strawberry glass. She extends one paw, slowly, while maintaining eye contact.'),
      P('shock', 'Yuki. Yuki, no. Yuki, I swear on my mother. YUKI. That is a sacred object!'),
      qt('CATCH YUKI BEFORE THE GLASS FALLS!', 3.5, 7,
        [ na('Paula crosses the kitchen faster than science allows and catches the cat in mid-crime. The glass rocks twice and stays.'),
          S('nana', 'smirk', 'Not bad. Most people would\'ve gone for the glass.'),
          P('happy', 'I know my customers.'),
          { type: 'remember', text: 'Nana noticed how fast you moved.' } ],
        [ na('Paula is too slow. The glass tips. A hand with a heavy silver ring comes out of nowhere and catches it without spilling a drop.'),
          S('nana', 'neutral', 'Your cat has a death wish.'),
          S('yuki', 'happy', 'Prrr.'),
          S('nana', 'smirk', '...I like her.') ]),
      S('nana', 'neutral', 'What\'s she called?'),
      P('happy', 'Yuki. It means snow. I know she\'s black. I thought it was funny.'),
      S('nana', 'neutral', 'Snow.'),
      na('For a moment Nana looks at the window, and is somewhere else, on a stopped train. Then she scratches the cat under the chin, and pretends she did not.'),
      S('nana', 'smirk', 'Stray, is she?'),
      P('sad', 'She was. She doesn\'t like being picked up, she bites anyone who loves her, and she sleeps on my neck every night. Sound like anyone?'),
      S('hachi', 'happy', 'Oh my gosh, it\'s Nana!'),
      S('nana', 'angry', 'Hachi. Rice. Now.'),

      lb('nail_bar'), mu('room'), sc('room-707'),
      na('After dinner Paula unrolls her kit across the low table. Forty colours. Tiny brushes. Things that look like surgery and smell like a chemistry lesson.'),
      S('hachi', 'happy', 'It\'s so pretty! Can you do strawberries? Can you do tiny strawberries? I\'ll pay you in curry!'),
      P('happy', 'Sit down. Give me your hand. I have made press-ons for strangers on the internet for two years. You are about to be my masterpiece.'),
      mi('nails'),
      ju('nails_great', { bond: 2 }),
      na('The result is uneven in places. One of the strawberries looks more like a small, worried potato.'),
      S('hachi', 'sad', 'I love my potato. His name is Kenji.'),
      ju('after_nails'),
      lb('nails_great'),
      S('hachi', 'shock', 'Nana. NANA. Look at my hands. I\'m never doing the dishes again.'),
      S('nana', 'smirk', 'You never did the dishes before.'),
      lb('after_nails'),

      sc('studio'),
      na('Word travels. By the next afternoon Paula has set up on an amp in the rehearsal room, and Blast has formed an orderly queue.'),
      S('nobu', 'happy', 'A real nail tech! From Europe! Is it true you can make my picking hand look like a rock star\'s? I want flames! Is flames too much?'),
      P('happy', 'Nobu, flames are the minimum for you. I\'ve wanted to do your hands for years. That came out wrong.'),
      S('yasu', 'neutral', 'Clear coat. Two fingers. They split on long sets.'),
      P('shock', 'Yasu. Yasu, please take your sunglasses off so I can see your cuticles. Sorry. So I can see you. Sorry.'),
      S('yasu', 'smirk', 'Cuticles only.'),
      S('shin', 'neutral', 'What\'s the cheapest thing you do?'),
      P('happy', 'For you? It\'s free, and I\'m also making you a sandwich. Don\'t argue. When did you last eat?'),
      S('shin', 'shock', 'Why does everyone in this building keep asking me that?'),
      S('yasu', 'neutral', 'Because you keep not answering.'),
      ch('A knock on the studio door. A tired Spanish voice in the corridor is asking somebody, in careful English, if this is "the comic".', [
        { label: 'Run to the door. That is your boyfriend.', rel: { samu: 2 }, flag: 'ran_samu', reply: [
          P('happy', 'SAMU! You came into the manga! You don\'t even like reading!')
        ] },
        { label: 'Stay perfectly still and finish Nobu\'s flames first.', rel: { samu: -1 }, flag: 'flames_first', reply: [
          P('smirk', 'One minute, amor! I\'m working! This is my Sistine Chapel!'),
          S('nobu', 'happy', 'Your boyfriend\'s here? Bring him in! Does he want flames?')
        ] }
      ]),
      na('He comes in sideways, holding a cat carrier and wearing the expression of a man who has decided to stop asking questions. Light beard. Hair pushed up at the front, flattened on one side from sleeping.'),
      S('samu', 'neutral', 'Paula. It\'s four in the morning at home, and you\'re in a comic.'),
      P('happy', 'How did you get here?'),
      S('samu', 'neutral', 'You told me I had to read it. I got as far as the strawberries, fell asleep and woke up in a stairwell. Your cat left without me.'),
      S('yuki', 'smirk', 'Mrrp.'),
      S('samu', 'happy', 'Yes, I saw you. Traitor. I brought her food, your charger and your other glasses.'),
      na('Everybody in the room quietly falls a little in love with this man.'),
      S('nobu', 'happy', 'He brought the charger across dimensions! Hachi-chan\'s going to cry when she hears this!'),
      S('yasu', 'neutral', 'You read the whole thing?'),
      S('samu', 'smirk', 'Two chapters. Are you the blond one?'),
      S('yasu', 'smirk', 'I like him.'),
      sc('room-707'),
      S('nana', 'neutral', 'So you\'re the boyfriend. You going to take her away from us?'),
      ch('Nana has Samu backed up against the fridge. Yuki is watching. Paula has about one sentence to save him.', [
        { label: 'Let him handle it. He can do this.', rel: { samu: 2, nana: 1 }, flag: 'samu_stood', reply: [
          S('samu', 'neutral', 'I\'m not taking her anywhere. I just came to make sure somebody made her eat.'),
          S('nana', 'neutral', '...'),
          S('nana', 'smirk', 'Hachi. He can stay. Give him the bad chopsticks.'),
          P('sad', 'I\'m not crying. It\'s the acetone.')
        ] },
        { label: '"He knows the cat\'s whole feeding schedule. That is my reason."', rel: { hachi: 2 }, flag: 'schedule', reply: [
          S('hachi', 'shock', 'That\'s the most romantic thing I\'ve ever heard! Junko! I have to call Junko!'),
          S('samu', 'neutral', 'It\'s on the fridge. It isn\'t difficult.'),
          S('nana', 'smirk', 'Hachi\'s going to want one of you now.')
        ] },
        { label: 'Offer Nana a free full set if she leaves him alone.', rel: { nana: 1 }, reply: [
          S('nana', 'smirk', 'You\'re bribing me with my own hands. I respect that.'),
          S('samu', 'happy', 'She does this. It\'s how she got my mother.')
        ] }
      ]),

      lb('reporters'), sc('newsstand'), mu('tension'),
      na('The next morning, three men with long lenses are waiting outside the building. Someone has told them Blast has a foreign "image consultant".'),
      S('misato', 'shock', 'Nana-san\'s private manicurist! I have so many questions! Is it true? What shade? May I have the cotton ball?'),
      P('happy', 'Misato-chan. Let me handle this. I have two years of training for this exact situation. It\'s called customer service.'),
      na('Paula walks up to the first reporter, smiling so warmly that he takes a step back.'),
      P('happy', 'Thank you so much for reaching out! I\'m so sorry to hear you\'re having that experience. May I take your order number?'),
      na('He does not have an order number. She apologises for this. She opens a ticket. She escalates him. Eleven minutes later he thanks her, and he leaves, feeling oddly better.'),
      S('yasu', 'smirk', 'Hire her.'),
      S('nana', 'happy', 'That was the scariest thing I\'ve ever seen.'),

      sc('backstage'), mu('room'),
      S('naoki', 'happy', 'HI! You\'re the nail person! Do mine! Do them like a sandwich! Have you got a sandwich?'),
      P('happy', 'Naoki, I have never been so happy to meet a human being. Sit. No. Sit. Don\'t touch that, it\'s wet.'),
      na('Somebody is humming in the doorway, very quietly. Long pale hair. She hides her hands behind her back as if they are not allowed out.'),
      S('reira', 'neutral', 'I\'m sorry. Is it only for the band? I don\'t want to be a bother.'),
      P('sad', 'Reira. Sit down. You could never be a bother. Do you want... what would you like?'),
      S('reira', 'happy', 'Nobody has asked me that today. Could it be something nobody else would pick?'),
      na('Paula paints a small moon on her left ring finger. Pale. Slightly off-centre. Reira looks at it for a long time and then, not knowing she is being heard, sings a little.'),
      P('sad', 'I\'m going to need a minute.'),
      S('takumi', 'smirk', 'Reira, you\'re wanted. You. The foreigner. You\'re not on any list I approved.'),
      ch('Takumi Ichinose is looking at your kit as though it owes him a percentage.', [
        { label: 'Smile. Tell him something warm in Romanian.', flag: 'romanian', rel: { hachi: 1 }, reply: [
          P('smirk', '[A long, warm, musical sentence in Romanian.]'),
          S('takumi', 'neutral', 'What does that mean?'),
          P('happy', 'It means "thank you for your time".'),
          na('It does not mean that. It concerns a goat, his ancestors, and a well.')
        ] },
        { label: 'Offer him a manicure, with direct eye contact.', rel: { nana: 1 }, flag: 'takumi_filed', reply: [
          S('takumi', 'smirk', 'I don\'t have time for that.'),
          P('smirk', 'I can see that from here. You bite the left thumb. Stress, is it? Terrible for the image.'),
          S('takumi', 'shock', '...'),
          na('Nobody has ever seen Takumi Ichinose put a hand in his pocket that quickly.')
        ] }
      ]),

      lb('three_am'), sc('room-707'), mu('sad'),
      le('Hey, Nana.\n\nThe thing about knowing your whole story is that I could not look at you properly.\n\nI would be laughing, you would be stealing my fries, and in the back of my head I would be counting. I know how far apart you two end up. I know how much it is going to hurt.\n\nI am kind. Everyone says so. It is a terrible thing to be when you know what is coming.'),
      na('Three in the morning. Samu is asleep on the floor with the cat on his neck. Hachi fell asleep mid-sentence. There is one lamp on, and Nana is at the table with her guitar and an unlit cigarette.'),
      S('nana', 'neutral', 'You look at me like I\'m about to break.'),
      P('sad', 'I don\'t.'),
      S('nana', 'smirk', 'You do. You\'ve done it since the kitchen. You look at Hachi like that too. Come on. You still owe me a set.'),
      na('She holds out her hand. And then, without being asked, she slides off the heavy silver ring, and sets it on the table between them.'),
      P('shock', 'You never take that off.'),
      S('nana', 'neutral', 'How would you know that?'),
      na('Paula does not answer. She takes the hand. There are calluses on the fingertips. A small scar on one knuckle. It is warmer than she thought it would be.'),
      na('Black. Two coats. She works very slowly, because she does not want to get to the end.'),
      S('nana', 'neutral', 'Whatever it is you know. Is it bad?'),
      ch('Her hand is in yours. There is no one else awake. You could say it.', [
        { label: 'Tell her. All of it. She deserves to know.', flag: 'told_nana', rel: { nana: 1 }, next: 'demon_clause' },
        { label: '"It\'s hard. But you are so loved. You have no idea."', rel: { nana: 2 }, flag: 'so_loved', reply: [
          S('nana', 'sad', '...You\'re a strange girl, Spain.'),
          P('sad', 'People are going to cry about you in languages you\'ve never heard. For years and years. I just wanted to tell you that.'),
          S('nana', 'neutral', 'Finish my hand.')
        ] },
        { label: '"Keep calling Hachi. Even when it\'s hard. Promise me."', rel: { nana: 1, hachi: 2 }, flag: 'call_hachi', remember: 'Nana did not promise. She did not say no.', reply: [
          S('nana', 'neutral', 'That\'s a weird thing to ask.'),
          P('sad', 'I know.'),
          S('nana', 'smirk', 'She never stops talking. How could I not?'),
          P('sad', 'Yes. Exactly. Remember you said that.')
        ] },
        { label: '[Say nothing. Keep painting.]', silent: true, rel: { nana: 1 }, flag: 'kept_painting', reply: [
          na('She keeps painting. After a while Nana stops asking, and rests her head against the wall, and hums something that has no words yet.')
        ] }
      ], 12),
      na('When it is done, Nana holds her hand up to the lamp and turns it over. Then she puts the ring back on. She is careful not to smudge it.'),
      S('nana', 'smirk', 'Not bad. Don\'t tell Hachi I said so.'),
      ju('kitchen'),

      lb('demon_clause'), sc('demon-realm'), mu('tension'),
      P('sad', 'Nana, there\'s something I have to...'),
      na('The lamp goes out. The kitchen is gone. A very tall chair turns around, slowly, and with difficulty, because there is a cat on it.'),
      S('demon', 'happy', 'SPOILERS! My favourite violation! Paragraph nine, sub-section "no telling the characters".'),
      P('angry', 'You\'re real! Hachi has a notebook about you!'),
      S('demon', 'smirk', 'And it is beautifully kept. Readers must not interfere, my dear. You get one sentence, and then you go home.'),
      S('yuki', 'angry', 'HSSSSS.'),
      S('demon', 'shock', 'Is that... is that a CAT? Get it off! I am ALLERGIC! Nobody said there would be a CAT!'),
      ch('The Demon Lord is sneezing. You have one sentence left in this world.', [
        { label: 'Use it. Say the thing she needs to hear.', next: 'end_told' },
        { label: 'Send Yuki in. Now.', flag: 'yuki_attack', next: 'yuki_wins' }
      ]),

      lb('yuki_wins'),
      na('Yuki walks across the contract. She sits on it. Then, very deliberately, she places one paw on the signature line, and pushes the inkwell off the desk.'),
      S('demon', 'angry', 'That is a BINDING PAWPRINT! That\'s legally... YASU! Is that legally anything?!'),
      S('yasu', 'neutral', 'It\'s airtight.'),
      S('samu', 'neutral', 'Why\'s he asking the drummer?'),
      end('yuki'),

      lb('end_told'), sc('hometown'), mu('sad'),
      na('She says it. One sentence. The room comes apart like wet paper, and the last thing she sees is Nana\'s face, listening.'),
      sc('room-707'),
      na('Paula wakes on her sofa in Spain. It is morning. Samu is making coffee, the cat is on her neck, and her nails are painted black. Two coats. She did not do that.'),
      P('sad', 'Samu. Samu, come and look at the book.'),
      na('On the last page of volume one, where there has never been anything, there is one line of handwriting, in black biro. It says thanks, Spain. Now finish my other hand.'),
      end('told'),

      lb('kitchen'), sc('room-707'), mu('room'),
      na('Dawn. Hachi is awake, standing in the kitchen in a dressing gown, attacking an egg.'),
      S('hachi', 'happy', 'Paula, can I ask you something? Samu looks at you like you\'re the last bus home. How did you know?'),
      P('happy', 'Honestly? I had the flu, and he drove forty minutes for a specific soup, and then he got the wrong soup, and he cried a little.'),
      S('hachi', 'sad', 'Waaaah! That\'s so beautiful! I want the wrong soup!'),
      P('sad', 'You\'ll get so much love, Hachi. It won\'t always look the way you drew it. But it\'s so much, I promise.'),
      S('hachi', 'sad', 'Why are you crying? Now I\'m crying. Is it the eggs?'),
      S('nana', 'neutral', 'There are two of them now. I\'m moving out.'),
      S('samu', 'smirk', 'Coffee? I found the good cups.'),
      S('nana', 'smirk', 'Not those two.'),
      S('samu', 'neutral', 'I know. I read that far.'),
      sc('platform'), mu('sad'),
      na('It starts to snow on the morning the air changes. Paula can feel it, the way you can feel the last page of a book getting thin under your right thumb.'),
      S('samu', 'neutral', 'I think we\'ve got to go, Pau. I can see the sofa through the wall.'),
      ch('The edges of Tokyo are going soft. Everyone came to the station. Nana is pretending she was already walking this way.', [
        { label: 'Go home with Samu and Yuki. It\'s time.', rel: { samu: 1 }, next: 'going_home' },
        { label: 'Ask if there is room for a nail bar at 707. Just a little while longer.', next: 'staying' }
      ]),

      lb('staying'),
      S('hachi', 'happy', 'Stay! You can have the corner by the heater! Nana sleeps on the floor there anyway!'),
      S('nana', 'smirk', 'Tuesdays only. And the boyfriend does the dishes.'),
      S('samu', 'happy', 'I\'ve been doing them since Thursday.'),
      S('yuki', 'happy', 'Prrr.'),
      P('happy', 'Then I\'ll need an appointment book. And a card reader. And a proper chair. Hachi, stop crying, you\'ll smudge.'),
      end('regular'),

      lb('going_home'),
      P('sad', 'I have to go back. I didn\'t think I\'d be so bad at this. I knew it was coming and everything.'),
      S('hachi', 'sad', 'You\'ll write, won\'t you? I\'m very good at letters! I\'m told they go on a bit!'),
      P('sad', 'I know they do, Hachi. I\'ve read them all.'),
      ju('wrapped', { flag: 'so_loved' }),
      ju('wrapped', { flag: 'call_hachi' }),
      ju('last_look'),
      lb('wrapped'),
      S('nana', 'neutral', 'Hey. Spain. Here.'),
      na('It is wrapped in a page of newspaper. It has strawberries all over it. It\'s a third glass, from the same shop.'),
      S('nana', 'smirk', 'They\'re ridiculous. Carry it yourself.'),
      P('sad', 'Nana...'),
      S('nana', 'sad', 'Whatever it was you wouldn\'t tell me. I\'m not scared of it. Go home, and eat something.'),
      lb('last_look'),
      S('yuki', 'neutral', 'Mrrp.'),
      S('nana', 'happy', 'See you, Snow.'),
      sc('hometown'),
      le('Hey, Nana.\n\nI woke up on the sofa with my cat on my neck, and Samu asleep with one arm hanging off the edge, and my hand wrapped around something cold.\n\nI do not know how to explain it to customs.\n\nI am still counting chapters, you know. I can\'t help that. But I have been thinking about the middle part now, the part with the rice and the terrible chopsticks and Hachi shouting about a potato. Nobody gets to take that part back. It already happened.\n\nI got to hold your hand.\n\nI do nails, Nana. It is a small job. You sit very close to someone for an hour, and they tell you things, and for a little while they are looked after.\n\nI think that is what you all did for me.\n\nTuesdays are still free, if you are ever passing.\n\nPaula'),
      end('home')
    ]
  };

  if (NG.WhatIf) NG.WhatIf.episodes.push(episode);

  /* ---------- Paula's Nail Bar ---------- */

  var SHADES = {
    pink: { n: 'Hachi pink', css: '#ff8db5' }, black: { n: 'Punk black', css: '#141014' }, red: { n: 'Blood red', css: '#c5102a' },
    cream: { n: 'Cream', css: '#f3e6cf' }, gold: { n: 'Gold', css: '#f4c430' }, moon: { n: 'Moon', css: '#2b2f55', mark: '☾', ink: '#f3ece0' },
    berry: { n: 'Strawberry', css: '#ffd7e3', mark: '❀', ink: '#e8294f' }, tartan: { n: 'Tartan', css: 'repeating-linear-gradient(0deg, rgba(0,0,0,.35) 0 3px, transparent 3px 9px), repeating-linear-gradient(90deg, rgba(0,0,0,.35) 0 3px, transparent 3px 9px), #b5122a' }
  };
  var CLIENTS = [
    { who: 'hachi', ex: 'happy', say: 'Strawberries on my ring fingers! And pink! Everywhere pink!', want: ['pink', 'pink', 'berry', 'pink', 'pink'], palette: ['pink', 'berry', 'cream', 'gold'] },
    { who: 'nana', ex: 'smirk', say: 'Black. Tartan on the thumb. Nothing cute, Spain.', want: ['tartan', 'black', 'black', 'black', 'black'], palette: ['black', 'tartan', 'red', 'pink'] },
    { who: 'nobu', ex: 'happy', say: 'Red, red, GOLD, red, red! For the solo! Is that too much? Do it!', want: ['red', 'red', 'gold', 'red', 'red'], palette: ['red', 'gold', 'black', 'cream'] },
    { who: 'reira', ex: 'neutral', say: 'Cream, please. Just one moon, on the fourth one. If it isn\'t any trouble.', want: ['cream', 'cream', 'cream', 'moon', 'cream'], palette: ['cream', 'moon', 'pink', 'gold'] },
    { who: 'yasu', ex: 'neutral', say: 'Clear. Well, cream. Black on the two I hit things with.', want: ['black', 'black', 'cream', 'cream', 'cream'], palette: ['cream', 'black', 'gold', 'red'] }
  ];
  var LINES = [
    ['Hachi loves it. Hachi loves everything. That is not a review.', 'Some of those are technically nails.'],
    ['A solid effort. Nobody has asked for a refund, out loud.', 'Yuki walked through it, but it mostly recovered.'],
    ['Word is spreading through the building. There is a queue on the stairs.', 'Nana looked at her hand for a whole second. That is a rave.'],
    ['Five flawless sets. Trapnest have asked if you do house calls.', 'Paula cries a little. It is the acetone. It is not the acetone.']
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function make(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html !== undefined) n.innerHTML = html; return n; }
  function sfx(n) { if (NG.Audio && NG.Audio.sfx) NG.Audio.sfx(n); }
  function face(who, ex) { try { return NG.Art ? NG.Art.portrait(who, ex) : ''; } catch (e) { return ''; } }

  function paint(el, id) {
    var s = id && SHADES[id];
    el.style.background = s ? s.css : '';
    el.textContent = s && s.mark ? s.mark : '';
    el.style.color = s && s.ink ? s.ink : '';
  }

  function startNails(container, opts) {
    var T = 35, timer = null, sent = false, score = 0, perfect = 0, idx = 0, tl = T, brush = null, nails = [], yukiAt = 0, yukiOn = false, yukiSpot = -1;
    var root = make('div', 'pn');
    root.innerHTML = '<div class="pn-top"><span class="pn-hud"></span><button type="button" class="pn-x" aria-label="Quit">&#10005;</button></div><div class="pn-body"></div>';
    container.appendChild(root);
    var body = root.querySelector('.pn-body'), hud = root.querySelector('.pn-hud');
    root.querySelector('.pn-x').addEventListener('click', function () { finish(true); });

    function finish(quit, res) {
      if (sent) return;
      sent = true;
      clearInterval(timer);
      opts.onFinish(quit ? { score: 0, stars: 0, effects: {}, quit: true } : res);
    }
    function btn(label, fn) { var b = make('button', 'pn-btn', label); b.type = 'button'; b.addEventListener('click', fn); return b; }

    function howto() {
      body.innerHTML = '';
      var c = make('div', 'pn-card', '<div class="pn-host">' + face('paula', 'happy') + '</div><h2>Paula\'s Nail Bar</h2><p>' + NG.Minigames.nails.howto + '</p>');
      c.appendChild(btn('Open the shop', function () { sfx('select'); client(); }));
      body.appendChild(c);
    }

    function client() {
      var c = CLIENTS[idx];
      tl = T; brush = null; nails = [null, null, null, null, null]; yukiOn = false; yukiSpot = -1;
      yukiAt = idx > 0 ? 8 + Math.random() * 12 : Infinity;
      body.innerHTML = '';
      var head = make('div', 'pn-client', '<div class="pn-face">' + face(c.who, c.ex) + '</div><p class="pn-say">' + c.say + '</p>');
      body.appendChild(head);
      body.appendChild(make('div', 'pn-bar', '<i></i>'));
      var want = make('div', 'pn-want', '<small>The order</small>');
      var wr = make('div', 'pn-row small');
      c.want.forEach(function (id) { var n = make('div', 'pn-nail'); paint(n, id); wr.appendChild(n); });
      want.appendChild(wr);
      body.appendChild(want);
      var hand = make('div', 'pn-row hand');
      c.want.forEach(function (_, i) {
        var n = make('button', 'pn-nail big');
        n.type = 'button';
        n.setAttribute('aria-label', 'Nail ' + (i + 1));
        n.addEventListener('click', function () {
          if (yukiOn && yukiSpot === i) return;
          if (!brush) { hint('Pick a polish first!'); return; }
          nails[i] = brush;
          paint(n, brush);
          sfx('good');
        });
        hand.appendChild(n);
      });
      body.appendChild(hand);
      var pal = make('div', 'pn-pal');
      c.palette.forEach(function (id) {
        var b = make('button', 'pn-shade', '<span></span><small>' + SHADES[id].n + '</small>');
        b.type = 'button';
        paint(b.firstChild, id);
        b.addEventListener('click', function () {
          brush = id;
          [].forEach.call(pal.children, function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          sfx('select');
        });
        pal.appendChild(b);
      });
      body.appendChild(pal);
      body.appendChild(make('div', 'pn-hint', 'Tap a polish, then tap a nail.'));
      body.appendChild(btn('Done!', judge));
      drawHud();
      clearInterval(timer);
      var last = Date.now();
      timer = setInterval(function () {
        var dt = (Date.now() - last) / 1000;
        last = Date.now();
        tl -= dt;
        var bar = body.querySelector('.pn-bar i');
        if (bar) bar.style.width = Math.max(0, tl / T * 100) + '%';
        drawHud();
        if (!yukiOn && T - tl > yukiAt) yuki();
        if (tl <= 0) judge();
      }, 100);
    }

    function hint(t) { var h = body.querySelector('.pn-hint'); if (h) h.textContent = t; }
    function drawHud() { hud.innerHTML = 'Client <b>' + (idx + 1) + '/' + CLIENTS.length + '</b> &middot; Score <b>' + score + '</b> &middot; ' + Math.max(0, Math.ceil(tl)) + 's'; }

    // Yuki sits on one nail and has to be shooed off; she smudges it if ignored.
    function yuki() {
      yukiOn = true;
      yukiSpot = Math.floor(Math.random() * 5);
      var hand = body.querySelector('.pn-row.hand');
      if (!hand) return;
      var cat = make('button', 'pn-cat', face('yuki', 'smirk') || 'Mrrp');
      cat.type = 'button';
      cat.setAttribute('aria-label', 'Shoo Yuki');
      var host = hand.children[yukiSpot];
      host.appendChild(cat);
      hint('YUKI! Tap her before she smudges it!');
      sfx('boo');
      var spot = yukiSpot, gone = false;
      cat.addEventListener('click', function (e) {
        e.stopPropagation();
        if (gone) return;
        gone = true;
        cat.remove();
        yukiSpot = -1;
        score += 20;
        hint('Shoo! +20');
        sfx('perfect');
      });
      setTimeout(function () {
        if (gone || sent || !cat.isConnected) return;
        gone = true;
        cat.remove();
        yukiSpot = -1;
        nails[spot] = null;
        paint(host, null);
        hint('She walked through it. Repaint that one!');
        sfx('miss');
      }, 3200);
    }

    function judge() {
      clearInterval(timer);
      var c = CLIENTS[idx], right = 0;
      c.want.forEach(function (id, i) { if (nails[i] === id) right++; });
      var full = right === 5, pts = right * 40 + (full ? 100 + Math.round(Math.max(0, tl) * 3) : 0);
      if (full) perfect++;
      score += pts;
      sfx(full ? 'win' : right >= 3 ? 'good' : 'miss');
      var verdict = full ? 'Perfect set!' : right >= 3 ? 'Close enough to tip.' : 'Oh. Oh no.';
      body.innerHTML = '';
      var card = make('div', 'pn-card', '<div class="pn-host">' + face(c.who, full ? 'happy' : right >= 3 ? 'smirk' : 'shock') + '</div><h2>' + verdict + '</h2><p>' + right + ' of 5 nails correct &middot; +' + pts + '</p>');
      idx++;
      card.appendChild(btn(idx < CLIENTS.length ? 'Next client' : 'Close the shop', idx < CLIENTS.length ? client : results));
      body.appendChild(card);
      drawHud();
    }

    function results() {
      var stars = perfect >= 4 ? 3 : perfect >= 2 ? 2 : perfect >= 1 || score >= 500 ? 1 : 0;
      body.innerHTML = '';
      var s = new Array(stars + 1).join('&#9733;') + new Array(4 - stars).join('&#9734;');
      var c = make('div', 'pn-card', '<div class="pn-host">' + face('paula', stars >= 2 ? 'happy' : 'sad') + '</div><h2>Shop report</h2><div class="pn-stars">' + s + '</div><p>Score ' + score + ' &middot; Perfect sets ' + perfect + '</p><p>' + pick(LINES[stars]) + '</p>');
      c.appendChild(btn('Continue', function () { finish(false, { score: score, stars: stars, effects: { bond: stars, harmony: stars >= 2 ? 1 : 0 }, quit: false }); }));
      body.appendChild(c);
      if (NG.Audio && NG.Audio.voice) NG.Audio.voice(stars >= 2 ? 'so-happy' : 'laugh');
    }

    howto();
    return {
      destroy: function () {
        sent = true;
        clearInterval(timer);
        if (root.parentNode) root.parentNode.removeChild(root);
      }
    };
  }

  NG.Minigames = NG.Minigames || {};
  NG.Minigames.nails = {
    id: 'nails', title: 'Paula\'s Nail Bar',
    howto: 'Everyone at 707 wants their nails done. Match each client\'s order: tap a polish, then tap a nail. You have 35 seconds per client, and bonus points for finishing early. Watch out for Yuki, who will sit on your work.',
    start: startNails
  };
})();
