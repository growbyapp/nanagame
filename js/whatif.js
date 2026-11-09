/* HEY, NANA - What If...? All dialogue is original, written for this fan game. */
window.NG = window.NG || {};
(function () {
  'use strict';
  function sc(id) { return { type: 'scene', id: id }; }
  function mu(id) { return { type: 'music', id: id }; }
  function le(text) { return { type: 'letter', text: text }; }
  function na(text) { return { type: 'narrate', text: text }; }
  function sl(who, expr, text) { return { type: 'say', who: who, expr: expr, text: text, side: 'left' }; }
  function sr(who, expr, text) { return { type: 'say', who: who, expr: expr, text: text, side: 'right' }; }
  function lb(name) { return { type: 'label', name: name }; }
  function ju(to, cond) { var s = { type: 'jump', to: to }; if (cond) s.if = cond; return s; }
  function ch(prompt, options, timer) { var s = { type: 'choice', prompt: prompt, options: options }; if (timer) s.timer = timer; return s; }
  function qt(prompt, seconds, taps, success, fail) { return { type: 'qte', prompt: prompt, seconds: seconds, taps: taps, success: success, fail: fail }; }
  function re(text) { return { type: 'remember', text: text }; }
  function st(effects) { return { type: 'stat', effects: effects }; }
  function en(id) { return { type: 'wfend', id: id }; }

  /* 1 ------------------------------------------------------------------ */
  var ep1 = {
    id: 'ren-lives', manga: true, title: 'Forty Seconds', spoiler: true,
    tagline: 'A voicemail with nothing on it.',
    premise: 'It\'s past one in the morning when Hachi\'s phone lights up with a name that never calls her. Forty seconds. No words. She has about one good phone call in her.',
    cast: ['ren', 'nana', 'hachi', 'yasu'], scene: 'tokyo-night',
    endings: {
      passenger: { title: 'The Passenger Seat', caption: 'Nobody drove alone that night. Nobody ever quite stopped checking, either.' },
      clinic: { title: 'Ninety Days', caption: 'He left the band for a white room and came back with shaking hands and all his own.' },
      answered: { title: 'Pick Up', caption: 'She answered on the second ring and called him an idiot for eleven minutes. He lived to be called it again.' },
      the_road: { title: 'The Same Road', caption: 'Some nights do not change. We loved him anyway, and we still set a place.' }
    },
    steps: [
      sc('tokyo-night'), mu('sad'),
      le('Hey, Nana. I have rewritten this night in my head so many times that the paper has gone soft. Let me tell it the way I wish it went.'),
      na('It was past one. I was on the floor of a too-expensive apartment, eating cold rice over the sink, like a dog somebody had left a fortune to.'),
      { type: 'fx', id: 'phone-buzz' },
      na('My phone lit up. Ren. Ren never called me. I don\'t think Ren knew he owned my number.'),
      na('It went to voicemail before I could get the rice out of my mouth. Forty seconds. No words. Just someone breathing, and a lighter.'),
      sl('hachi', 'shock', 'Ren? That\'s not a wrong number, is it? Nobody breathes that sadly by accident.'),
      ch('Something is wrong and you have about one good phone call in you.', [
        { label: 'Call Yasu. He always knows what to do.', flag: 'told_yasu', rel: { yasu: 1 }, remember: 'Yasu will remember who called him first.', reply: [
          sc('studio'),
          sr('yasu', 'neutral', 'Slow down, Hachi. Did you eat something? Good. Now say it again from the beginning.'),
          sl('hachi', 'sad', 'He breathed at me, Yasu! For forty seconds! And it was the worst thing I ever heard!'),
          sr('yasu', 'sad', 'He sold his spare guitar on Tuesday. I was hoping that meant nothing.'),
          sr('yasu', 'neutral', 'Go to his building if you can. I\'ll come round the back way. Don\'t be brave. Be in the way.')
        ], next: 'garage' },
        { label: 'Call Nana. Whatever is between them, it\'s hers.', flag: 'called_nana', rel: { nana: 2 }, remember: 'Nana will remember that you called her.', reply: [
          sc('rooftop'),
          sr('nana', 'angry', 'It\'s one in the morning. If this is about cake, I\'m hanging up.'),
          sl('hachi', 'sad', 'It\'s Ren. He left me breathing. I think he wanted to call you and got scared and pressed me.'),
          sr('nana', 'neutral', 'Ren doesn\'t get scared. Ren gets tired and calls it being busy.'),
          na('A pause so long I checked the signal. I heard her light a cigarette and not smoke it.'),
          sr('nana', 'sad', 'Fine. I\'ll keep my phone on. That\'s not me caring. That\'s me owning a phone.')
        ], next: 'garage' },
        { label: 'No time. Get a taxi and go to him yourself.', flag: 'ran', rel: { ren: 1 }, remember: 'Ren noticed you came alone.', reply: [
          na('I went out in slippers. The driver looked at the slippers, then at my face, and didn\'t make conversation.')
        ], next: 'garage' }
      ]),
      lb('garage'), sc('tokyo-night'), mu('tension'),
      na('He was down in the parking level with his coat half on, patting his pockets like someone looking for a reason.'),
      sr('ren', 'neutral', 'Hachi. You\'re wearing slippers.'),
      sl('hachi', 'sad', 'And you\'re wearing that face. Where are you going?'),
      sr('ren', 'neutral', 'For a drive. Somebody\'s got a key I need.'),
      na('He was calm in the wrong way. His hands were careful about everything. The car keys were in the left one.'),
      ch('He\'s walking to the car.', [
        { label: 'Give me the keys, Ren.', flag: 'demanded', rel: { ren: -1 }, reply: [
          sr('ren', 'angry', 'No.'),
          na('It was the most words he had ever spent on me in anger. He kept walking. I have never been fast. I ran anyway.')
        ], next: 'grab' },
        { label: 'Then take me with you.', flag: 'ride', rel: { ren: 1 }, reply: [
          sr('ren', 'smirk', 'You get carsick in elevators.'),
          sl('hachi', 'happy', 'Then you\'ll have to drive slowly, and it\'ll be your fault if I ruin your seats.')
        ], next: 'ride' },
        { label: '[Say nothing]', silent: true, reply: [ na('I opened my mouth. I\'m so sorry. Nothing came out, and the door shut, and the engine turned over.') ], next: 'he_goes' }
      ], 6),
      lb('grab'),
      qt('GRAB THE KEYS!', 3, 9,
        [ na('I got two fingers through the ring and held on like a dog with a slipper. It\'s what I was named for.'), ju('keys_taken') ],
        [ na('He lifted them out of reach without even looking. Not unkindly. That was the worst part.'), ju('he_goes') ]),

      lb('keys_taken'), sc('tokyo-night'), mu('sad'),
      na('He didn\'t fight me. He just sat down on the concrete, all at once.'),
      sr('ren', 'sad', 'I was only going to ask her to open it. It\'s getting heavy.'),
      na('The padlock. He meant the padlock at his throat, the one she put there when they were kids. There is one key, and Nana has never once let it out of 707.'),
      { type: 'prop', id: 'padlock' },
      sl('hachi', 'sad', 'Then ask her in the daytime. With your coat on properly.'),
      sr('ren', 'neutral', 'Yasu knows, you know. About how bad. He\'s stopped saying so. That\'s how you can tell.'),
      ch('Ren has never told anyone this much. What do you do with it?', [
        { label: 'Tell him he has to stop, and you\'ll drive him tonight.', flag: 'pushed_clinic', rel: { ren: 1, yasu: 1 }, reply: [
          sr('ren', 'sad', 'They\'ll find out. The label. It\'ll be in every newsstand by Friday.'),
          sl('hachi', 'angry', 'Then you\'ll be alive and embarrassed on Friday! I recommend it! I do it every week!')
        ], next: 'clinic_end' },
        { label: 'Call Nana and put the phone in his hand.', flag: 'called_nana', rel: { nana: 1 }, reply: [
          na('I dialled, I held it out, and for once in my life I shut up.')
        ], next: 'phone_rings' }
      ]),

      lb('ride'), sc('road-van'), mu('room'),
      na('We drove at about the speed of a parade. Well, I told him I\'d throw up if he went faster, and it wasn\'t even a lie.'),
      sr('ren', 'neutral', 'You talk a lot for someone who\'s holding the door handle.'),
      sl('hachi', 'happy', 'Talking is how I keep my lunch in. Ren, does she know you\'re coming?'),
      sr('ren', 'sad', 'No. I\'m not good at the part before arriving.'),
      na('He pulled in under a vending machine light without being asked, and stared at his hands on the wheel.'),
      sr('ren', 'sad', 'They do this now. They didn\'t used to. I could play anything.'),
      ju('call_from_car', { flag: 'called_nana' }),
      ch('His hands are shaking at the wheel. You have one chance to change who\'s driving.', [
        { label: 'Swap seats. You have a licence. Technically.', flag: 'swapped', rel: { ren: 1 }, reply: [
          sl('hachi', 'happy', 'I passed the test on the third go and only one of those cones had family.'),
          sr('ren', 'smirk', 'I\'m going to die in this car after all.')
        ], next: 'passenger_end' },
        { label: 'Ask him to go to a clinic instead of to Nana.', rel: { ren: -1, yasu: 1 }, reply: [
          sr('ren', 'neutral', 'You came all this way for that.'),
          sl('hachi', 'sad', 'I came all this way in slippers, Ren. I\'m not above begging.')
        ], next: 'clinic_end' }
      ]),
      lb('call_from_car'),
      na('My phone started up in my lap. Nana, of course. Nana, who had said she was only owning a phone.'),
      ju('phone_rings'),

      lb('he_goes'), mu('tension'),
      ju('phone_rings', { flag: 'called_nana' }),
      ju('yasu_blocks', { flag: 'told_yasu' }),
      ju('the_road'),

      lb('yasu_blocks'), sc('tokyo-night'),
      na('The car got as far as the ramp. Then it stopped, because there was a van older than me parked across the exit and a bald man leaning on it.'),
      sr('yasu', 'neutral', 'Evening, Ren. Terrible parking on my part. I may be here until spring.'),
      sl('ren', 'angry', 'Move it, Yasu.'),
      sr('yasu', 'neutral', 'I have moved everything for you since you were seventeen. Tonight I find I have a bad back.'),
      sl('ren', 'angry', 'Yasu.'),
      sr('yasu', 'angry', 'Get out of the car, Ren. I will not say it nicely again, and you have never heard me not say it nicely.'),
      na('I\'d known that man for years and I had never once been frightened of him. Ren turned off the engine.'),
      ch('Yasu looks at you over Ren\'s shoulder. He can\'t say this next part. You can.', [
        { label: 'Say it out loud: everyone knows he\'s using.', rel: { ren: -1, yasu: 2 }, reply: [
          sl('hachi', 'sad', 'We know, Ren. All of us. We\'ve been too polite to say it, and I\'m so sorry we were.'),
          na('Nobody had ever said it in that garage, or possibly in that decade.')
        ], next: 'clinic_end' },
        { label: 'Tell him Nana would rather have him alive and late.', rel: { ren: 1, nana: 1 }, reply: [
          sl('hachi', 'sad', 'She can wait until morning. She\'s waited through worse. Let Yasu drive you. Please.'),
          sr('yasu', 'smirk', 'I\'m a very good driver. People say it\'s like being carried by a disappointed father.')
        ], next: 'passenger_end' }
      ]),

      lb('phone_rings'), sc('rooftop'), mu('sad'),
      sr('nana', 'angry', 'Ren. It\'s me. I know it\'s you. Nobody else breathes like a shop closing.'),
      sl('ren', 'shock', 'Nana.'),
      sr('nana', 'neutral', 'Whatever you\'re bringing, don\'t bring it tonight. I look terrible and I\'m very busy not waiting.'),
      sl('ren', 'sad', 'I wanted you to open it.'),
      sr('nana', 'sad', 'No. Keep your dumb lock on. Get out of that car and stand where I can yell at you tomorrow.'),
      na('Eleven minutes, Nana. I timed it, the way you time something you can\'t do anything about. She insulted him the whole way through, and it was the most loving thing I ever heard.'),
      ju('answered_end'),

      lb('answered_end'), sc('tokyo-night'), mu('room'),
      re('He stayed.'),
      na('In the morning she took the first train and didn\'t tell anyone, and I pretended not to know, which I\'ve always been terrible at.'),
      en('answered'),

      lb('clinic_end'), sc('platform'), mu('room'),
      na('It was in the magazines by Friday, just as he said. He was alive to be furious about it.'),
      sr('takumi', 'neutral', 'Ninety days. Then we will discuss whether there is still a guitarist.'),
      na('Nana went to see him on day thirty. She brought nothing, stayed four minutes, and came back on day thirty-one.'),
      sl('nana', 'neutral', 'Don\'t look at me like that, Hachi. I left my lighter there.'),
      { type: 'prop', id: 'lighter' },
      en('clinic'),

      lb('passenger_end'), sc('road-van'), mu('room'),
      na('We got there at dawn. It took us four hours to do what should have taken two, and it was the best journey of my life.'),
      ju('pass_yasu', { notFlag: 'swapped' }),
      sr('ren', 'smirk', 'You\'re the worst driver I have ever met.'),
      sl('hachi', 'happy', 'And yet!'),
      ju('pass_done'),
      lb('pass_yasu'),
      sr('ren', 'neutral', 'Yasu drives like it\'s raining.'),
      sl('yasu', 'neutral', 'I drive like a man with the only licence in the car.'),
      lb('pass_done'),
      na('He stood outside her door with his hands in his pockets for a long time. Nana opened it before he knocked.'),
      en('passenger'),

      lb('the_road'), sc('rain-rift'), mu('sad'),
      re('Some nights do not change.'),
      na('The call came in the morning. I\'m not going to write that part down, Nana. You were there for all of what came after.'),
      na('I still have that voicemail. Forty seconds. I have never once been able to delete it, and I never told you.'),
      sl('yasu', 'sad', 'Have you eaten, Hachi? ...No. Me neither.'),
      sr('nana', 'sad', '...'),
      en('the_road')
    ]
  };

  /* 2 ------------------------------------------------------------------ */
  var ep2 = {
    id: 'hachi-nobu', title: 'Hachi Chooses Nobu', spoiler: true,
    tagline: 'The kind one. The honest life. The bill for it.',
    premise: 'Hachi takes the test, and walks past the penthouse to the boy from the inn.',
    cast: ['hachi', 'nobu', 'takumi', 'nana'], scene: 'inn',
    endings: {
      inn_life: { title: 'Mrs. Terashima of the Inn', caption: 'She learned to fold a guest towel in thirds. Some nights she still counted what it cost him.' },
      two_fathers: { title: 'The Complicated Birthday Party', caption: 'One cake. Two men not looking at each other. A child who thought this was normal, and was right.' },
      her_own: { title: 'Table for Two', caption: 'She picked neither of them. It was terrifying, and the rice was hers.' },
      let_go: { title: 'The Kindest Thing He Did', caption: 'He drove her to the penthouse himself and never played that song again.' }
    },
    steps: [
      sc('room-707'), mu('sad'),
      le('Hey, Nana. Do you ever think about the other door? I do, mostly while cleaning. This is the version where I knocked on the one with the guitar behind it.'),
      na('Two lines. I looked at them for so long that I believe they got embarrassed.'),
      sl('hachi', 'shock', 'Okay. Okay okay okay. Okay. Who do I tell? Is there a form?'),
      sr('junko', 'neutral', 'Komatsu Nana. Sit down. Whose is it, and don\'t say fate.'),
      sl('hachi', 'sad', 'I don\'t know, Jun-chan. Takumi, or Nobu. That\'s the whole horrible sentence.'),
      sr('junko', 'neutral', 'Then that\'s your answer for now. "I don\'t know" is allowed. Drink this.'),
      ch('Before you tell anyone else, who do you owe the truth?', [
        { label: 'Tell Nana first. It\'s her home too.', flag: 'told_nana', rel: { nana: 2 }, remember: 'Nana will remember you came to her first.', reply: [
          sr('nana', 'neutral', 'Well. That explains why you cried at a tofu advert.'),
          sr('nana', 'sad', 'Whatever you pick, there\'s a room here. I\'ll be horrible about it. There\'s still a room.')
        ] },
        { label: 'Tell Nobu first. You owe him the worst of it.', flag: 'told_nobu_first', rel: { nobu: 2 }, reply: [
          na('He had been restringing something. He put it down slowly, as if it could wake up.') ] },
        { label: 'Tell no one yet. Buy a cake and think.', rel: { nana: -1 }, reply: [
          na('I ate an entire strawberry shortcake on a bench in the cold. It didn\'t advise me.') ] }
      ]),
      sc('live-house'), mu('room'),
      ju('nobu_knew', { flag: 'told_nobu_first' }),
      na('I told him the next day. I\'d have had to anyway. He can count, whatever he lets people think.'),
      lb('nobu_knew'),
      sr('nobu', 'shock', 'Mine or not, I don\'t care! I mean I care! I care in the good way!'),
      ju('nobu_no_days', { notFlag: 'told_nobu_first' }),
      sr('nobu', 'neutral', 'You told me first. Before anyone. I\'ve been thinking about that for two days. It\'s my favourite thing.'),
      lb('nobu_no_days'),
      sl('hachi', 'sad', 'Nobu, you can\'t just decide that. You\'re twenty. You have a band. You can\'t even fold a towel.'),
      sr('nobu', 'happy', 'I decide it all the time! I decided about you on the first day and nobody has been able to stop me.'),
      sr('nobu', 'neutral', 'I\'ll take you to the inn. My mother will be terrifying. Then she\'ll feed you. That\'s how it goes.'),
      ch('He means every word, and he hasn\'t thought about a single one.', [
        { label: 'Say yes. Let somebody be simple about it.', flag: 'yes_nobu', rel: { nobu: 2 }, reply: [
          sl('hachi', 'happy', 'Yes. Yes? Is that allowed? I said yes.'),
          sr('nobu', 'happy', 'YES! Sorry. Yes. I\'ll be very quiet about it from now on. YES.')
        ] },
        { label: 'Say the true thing: it might be Takumi\'s and he should know.', flag: 'honest', rel: { nobu: -1 }, remember: 'Nobu heard that. He said he didn\'t mind.', reply: [
          sr('nobu', 'sad', 'I know. I can count too, you know. I don\'t mind.'),
          na('He minded. He minded so much that he smiled. That was how I found out what kind of person I was about to be married to.')
        ] }
      ]),
      sc('inn'), mu('room'),
      na('The inn was older than everyone\'s feelings. Nobu\'s mother knelt at the entrance and looked at my shoes.'),
      sr('nobu', 'shock', 'I brought home a girl and a situation!'),
      na('She finished with my shoes and started on me. Then she told me my posture was a tragedy, and put a bowl of soup in my hands.'),
      na('I learned about towels. I learned that guests don\'t want to see you carry anything. I learned the word for each kind of pickle.'),
      sr('nobu', 'happy', 'See? You\'re a natural! The man in room four says you\'re very loud in a nice way.'),
      ju('no_nana_inn', { notFlag: 'told_nana' }),
      na('You came in the second month, Nana, in black from collar to boots, and you took them off at the step without being asked.'),
      sr('nana', 'neutral', 'I taught her to cook, you know.'),
      na('This was a lie. You said it to Nobu\'s mother while folding a guest towel in thirds, perfectly, looking her in the eye. I\'ve never loved anyone more.'),
      sr('nana', 'smirk', 'She\'s loud. She\'ll cry on your floors. Feed her, or I\'ll come back.'),
      lb('no_nana_inn'),
      ju('wedding', { flag: 'told_nana' }),
      na('Junko told you. Of course she did.'),
      lb('wedding'),
      na('We got married at the shrine up the hill, in the rain. You stood at the back and didn\'t say one word, and when I walked past you fixed my collar so hard it hurt.'),
      ju('no_altar', { notFlag: 'yes_nobu' }),
      na('Nobu said yes before the priest had asked him anything.'),
      lb('no_altar'),
      na('Yasu rang in the third week, and asked after my health, and didn\'t ask what everyone in Tokyo was asking.'),
      sl('yasu', 'neutral', 'BLAST has a tour in the spring. I\'ll need to know whether I have a guitarist.'),
      ch('The band or the inn. And you\'re the one who gets to ask him.', [
        { label: 'Tell Nobu to go. You married a musician.', flag: 'sent_him', rel: { nobu: 1, nana: 1 }, reply: [
          sl('hachi', 'happy', 'Go on. Go and be loud somewhere else. I\'ll be here learning pickles.'),
          sr('nobu', 'sad', 'You\'ll be alone with my mother.'),
          sl('hachi', 'neutral', 'I know. Pray for me.')
        ] },
        { label: 'Ask him to stay. You\'re scared, and that\'s allowed.', flag: 'kept_him', rel: { nobu: 1, nana: -2 }, remember: 'BLAST will have to find someone else.', reply: [
          sr('nobu', 'neutral', 'Then that\'s that. It\'s fine! I don\'t mind.'),
          na('He put the guitar on top of the wardrobe, where the futons go. He dusted it. I wish he hadn\'t dusted it.')
        ] }
      ]),
      lb('knock'), sc('inn'), mu('tension'),
      na('The baby was a girl and nobody had to discuss it, because nobody could look anywhere but at her. Then, in the fifth month, a black car.'),
      na('He has never once called me Hachi. In all these years. I still can\'t tell you if that\'s love or bookkeeping.'),
      sr('takumi', 'neutral', 'You have kept this very tidy, Nana. I had to hear it from an accountant.'),
      ju('nobu_steady', { flag: 'honest' }),
      sl('nobu', 'angry', 'Get out of my mother\'s house.'),
      ju('nobu_said'),
      lb('nobu_steady'),
      na('He knelt first, the way his family always had at that door, and he bowed to the man properly, and he didn\'t shake at all.'),
      sl('nobu', 'neutral', 'She told me it might be yours before any of this happened. So you\'ve brought no news. Please leave my mother\'s house.'),
      lb('nobu_said'),
      sr('takumi', 'neutral', 'I will, in a moment. There is a blood test. There are lawyers. Or there is a conversation. Nana decides.'),
      ch('Takumi is holding out a folder. Nobu hasn\'t moved.', [
        { label: 'Take the folder. She deserves to know where she comes from.', flag: 'test', rel: { nobu: -2, takumi: 1 }, reply: [
          sr('nobu', 'sad', 'Right. Yes. No, it\'s right.') ], next: 'result' },
        { label: 'Hold the baby closer. She has a father. Get out.', flag: 'refused', rel: { nobu: 2, takumi: -2 }, reply: [
          sr('takumi', 'smirk', 'You always did surprise me around once a year.') ], next: 'after_refuse' },
        { label: '[Say nothing]', silent: true, flag: 'froze', reply: [
          na('I looked at the floor. Takumi set the folder on it, like a bowl for a cat, and left. It sat there for a week.') ], next: 'result' }
      ], 8),
      lb('after_refuse'),
      na('He didn\'t come back. He sent money every month to an account in her name, and no note, and I never knew whether to hate it.'),
      ju('stay_inn', { rel: { nobu: 3 } }),
      ju('her_way'),
      lb('stay_inn'), sc('inn'), mu('room'),
      ju('stay_quiet', { flag: 'kept_him' }),
      na('He came home from every tour with stories, and he told them at dinner, and the man in room four asked for autographs.'),
      en('inn_life'),
      lb('stay_quiet'),
      na('We\'re kind to each other. I want you to know that, Nana. Some evenings he hums. I don\'t ask him what.'),
      en('inn_life'),

      lb('result'), sc('hometown'), mu('sad'),
      na('The envelope told me the thing a part of me had known all along. It was his. Takumi\'s.'),
      sr('nobu', 'sad', 'Well. She\'s got my mother\'s opinions, whatever a piece of paper says.'),
      ch('He\'s being so kind. It\'s becoming hard to breathe in here.', [
        { label: 'Try to make it work with all of them, in the open.', rel: { takumi: 1, nobu: 1 }, reply: [
          sl('hachi', 'sad', 'Could we be honest and terrible and all at the same birthday party? Is that a thing people do?'),
          sr('junko', 'smirk', 'In Tokyo? That\'s a Tuesday.')
        ], next: 'two_end' },
        { label: 'Release him. He shouldn\'t live inside someone else\'s mistake.', rel: { nobu: -1 }, reply: [
          sl('hachi', 'sad', 'You keep saying you don\'t mind. I can\'t listen to it anymore, Nobu.')
        ], next: 'release' },
        { label: 'Leave both of them. Rent somewhere with a window.', rel: { nobu: -1, takumi: -1 }, reply: [
          sl('hachi', 'neutral', 'I\'d like to find out what I\'m like. Apparently there\'s a person in here somewhere.')
        ], next: 'her_way' }
      ]),
      lb('two_end'), sc('room-707'), mu('room'),
      na('Every birthday there\'s one cake and two men who stand at opposite ends of the room discussing the weather as though it had wronged them.'),
      sr('takumi', 'neutral', 'The cake is too sweet.'),
      sl('nobu', 'neutral', 'She likes it.'),
      sr('nana', 'smirk', 'I come for the atmosphere.'),
      en('two_fathers'),
      lb('release'), sc('road-van'), mu('sad'),
      na('He wouldn\'t let a taxi take me. He drove me to the city in the van with her car seat strapped in, and he sang the whole way, badly.'),
      sr('nobu', 'happy', 'If he\'s ever bad to you, I\'ll hit him! I\'ll lose, but I\'ll do it!'),
      en('let_go'),
      lb('her_way'), sc('tokyo-night'), mu('room'),
      ju('her_way_room', { notFlag: 'refused' }),
      na('I was grateful to him every single day, and that turned out to be the problem. I left in March, with the baby and one bag.'),
      lb('her_way_room'),
      na('A room with a window and a stove with one good ring. I got a job at a bakery that shouted at me. She learned to walk toward the smell.'),
      sr('nana', 'neutral', 'You\'re doing it wrong. Give me that. ...You\'re doing it all right. Don\'t repeat that.'),
      en('her_own')
    ]
  };

  /* 3 ------------------------------------------------------------------ */
  var ep3 = {
    id: 'never-left', title: 'Never Left 707', spoiler: true,
    tagline: 'Two glasses. One landlord. The conversation they didn\'t have.',
    premise: 'On the last night of packing, one of them finally says the true thing out loud.',
    cast: ['hachi', 'nana', 'shin', 'nobu'], scene: 'room-707',
    endings: {
      our_room: { title: 'The Long Lease', caption: 'They stayed. The roof leaked. Everyone who ever loved them eventually came by to complain about the stairs.' },
      open_door: { title: 'A Year and a Key', caption: 'She still left, a year later, with a spare key and a schedule of Sundays.' },
      empty: { title: 'Boxes', caption: 'They said it wrong. The room emptied anyway, and the glasses got packed in separate boxes.' },
      everyone: { title: 'The Commune of Bad Decisions', caption: 'By spring there were eleven toothbrushes. The landlord left the country.' }
    },
    steps: [
      sc('room-707'), mu('room'),
      le('Hey, Nana. The strange thing about that apartment is that I can still walk through it in the dark. Let me go back to the night with the boxes. I\'d like to do it properly this time.'),
      na('You weren\'t speaking to me, and you were doing it so thoroughly that I\'d started apologising to the kettle.'),
      na('Tomorrow the movers take me to Takumi\'s. To the baby, and the room with the echo.'),
      sr('shin', 'smirk', 'This box says FRAGILE, then in smaller writing, LIKE HACHI. I\'m only reading what\'s written.'),
      sl('hachi', 'angry', 'Shin! Put that down and stop being a teenager at me.'),
      sr('nobu', 'shock', 'The fridge doesn\'t go through the door! How did the fridge get in? Who built this fridge in here?'),
      sr('nana', 'neutral', 'It was here before us. The fridge is the true tenant.'),
      na('It was the first thing you had said all day, and you said it to the fridge.'),
      na('The two glasses were on the windowsill. Red strawberries, a chip on yours. Shin picked one up and it went straight through his fingers.'),
      qt('CATCH THE GLASS!', 2, 6,
        [ re('The glass is safe.'), st({ bond: 1 }), na('I threw myself across a box of records. I caught it against my chest and I have the bruise in my memory to this day.'),
          sr('shin', 'shock', 'That was the fastest I have ever seen you move for anything that wasn\'t food.') ],
        [ na('It hit the floor and rolled. It didn\'t break. It just lost a small piece of the rim, next to the old chip, and we all looked at it.'),
          sr('shin', 'sad', '...I\'ll buy another one. I\'ll work. I\'m sorry.'),
          sr('nana', 'sad', 'You can\'t buy that one, kid. Go and help Nobu.') ]),
      na('Everyone went out for food, loudly and on purpose, the way people leave a room with a bomb in it. Then it was only us and the boxes.'),
      mu('sad'),
      ch('She\'s sitting on the windowsill with her back to you, smoking. You could start this a few ways.', [
        { label: '"I\'m scared to go, and I said I wasn\'t."', flag: 'scared', rel: { nana: 2 }, remember: 'Nana will remember you said it first.', reply: [
          sr('nana', 'neutral', 'You packed your spoons three days early. I noticed.') ] },
        { label: '"You could have asked me to stay, you know."', flag: 'accused', rel: { nana: -1 }, remember: 'Nana heard the blame in that.', reply: [
          sr('nana', 'angry', 'Ask you? You\'ve got a very rich man and a very real baby. What was I going to offer, the fridge?') ] },
        { label: 'Bring her tea and sit beside her.', flag: 'sat', rel: { nana: 1 }, reply: [
          na('I put it down next to her. She looked at it for a while. She drank it, which from you was practically a sonnet.') ] }
      ]),
      sr('nana', 'sad', 'People leave, Hachi. I\'ve got a very good system for it. I get angry two weeks before. Then it doesn\'t hurt.'),
      sl('hachi', 'sad', 'Does it work?'),
      sr('nana', 'smirk', 'I\'ve been told my system has some flaws.'),
      ju('hurt_path', { flag: 'accused' }),
      lb('the_door'),
      ch('This is the door. She has never opened it this far.', [
        { label: 'Tell her you want to stay here. With her. Really.', flag: 'stay', rel: { nana: 2 }, reply: [
          sl('hachi', 'happy', 'I don\'t want a penthouse, Nana. It has an echo. I keep apologising to it.') ], next: 'takumi_calls' },
        { label: 'Tell her you have to go, but you don\'t want to lose this.', flag: 'halfway', rel: { nana: 1 }, reply: [
          sl('hachi', 'sad', 'I have to try being somebody\'s family. But I can\'t do it without you shouting at me on Sundays.') ], next: 'takumi_calls' }
      ]),
      lb('hurt_path'), mu('tension'),
      sl('hachi', 'angry', 'That\'s not fair! You never ask anyone for anything and then you\'re furious when nobody guesses!'),
      sr('nana', 'angry', 'And you ask everyone for everything and say yes to the first one who answers.'),
      na('You put your cigarette out half-smoked. There are some sentences you can see leaving your own mouth, Nana. I know you saw that one too.'),
      ch('You could still reach her. Or you could pick up the box.', [
        { label: 'Apologise. Properly, with no but.', rel: { nana: 2 }, flag: 'apologised', reply: [
          sl('hachi', 'sad', 'I\'m sorry. That was mean. It was also true of you, but I\'m sorry anyway. Wait, that was a but.'),
          sr('nana', 'smirk', 'You\'re the worst at this in all of Japan.')
        ], next: 'the_door' },
        { label: 'Pick up the box.', rel: { nana: -2 }, reply: [ na('It wasn\'t even a heavy box.') ], next: 'empty_end' },
        { label: '[Say nothing]', silent: true, reply: [ na('You looked at me. I looked at the floor. I think we might have stayed like that forever if the door hadn\'t opened.') ], next: 'empty_end' }
      ], 7),

      lb('takumi_calls'), mu('tension'),
      { type: 'fx', id: 'phone-buzz' },
      na('My phone buzzed against the floorboards and jumped a little, like something alive. Takumi.'),
      ch('He\'ll be downstairs at eight. It\'s ringing.', [
        { label: 'Answer it and tell him the truth tonight.', flag: 'told_takumi', rel: { nana: 1, takumi: -1 }, reply: [
          sr('takumi', 'neutral', 'I see. Then I will have the movers sent back, and we will discuss the child like adults.'),
          sl('hachi', 'sad', 'He didn\'t even raise his voice. I wish he would, once. It would be so much easier to be scared of.')
        ] },
        { label: 'Turn it over. Tonight belongs to this room.', flag: 'ignored', rel: { nana: 2 }, reply: [
          na('I put it under a cushion. It buzzed twice more. You got up and sat on the cushion, without any expression at all.')
        ] }
      ]),
      sc('room-707'), mu('room'),
      sr('nobu', 'happy', 'WE ARE BACK AND WE GOT THE WRONG NOODLES.'),
      sr('shin', 'neutral', 'Why is nobody crying? We left so that you could cry. I carried a fridge door for this.'),
      ju('open_end', { flag: 'halfway' }),
      ju('our_end', { rel: { nana: 5 } }),
      ju('everyone_end', { flag: 'sat' }),
      ju('open_end'),

      lb('everyone_end'),
      na('Then they all came in. Nobody told them to stay. I just never stopped feeding them, and nobody ever quite went home.'),
      sr('yasu', 'neutral', 'I seem to live here. I have looked into it. There is no legal remedy.'),
      en('everyone'),

      lb('our_end'),
      ju('our_no_knock', { notFlag: 'ignored' }),
      na('He came at eight. Of course he came at eight. You answered the door, Nana, in your socks, with a cushion under one arm.'),
      sr('takumi', 'neutral', 'I am here for Nana.'),
      sr('nana', 'smirk', 'Which one?'),
      na('He looked at you for some time. It is the only occasion on record of that man having no reply. He came back on Monday with a lawyer and a very good pram.'),
      lb('our_no_knock'),
      sr('nana', 'smirk', 'The movers can have the fridge. If they can get it out, they\'ve earned it.'),
      na('I unpacked my spoons that night. You pretended not to watch. It was the only home I ever didn\'t have to earn.'),
      en('our_room'),

      lb('open_end'),
      sr('nana', 'neutral', 'A year. You stay one year, and I teach you how to be left properly. Then you go, and you take a key.'),
      sl('hachi', 'happy', 'That\'s the most romantic thing anyone has said to me and I\'m marrying someone.'),
      en('open_door'),

      lb('empty_end'), sc('platform'), mu('sad'),
      re('The glasses went in different boxes.'),
      na('The movers came at eight and they were good at it. It took less than an hour to make it look like nobody had ever laughed there.'),
      ju('no_chip', { bond: 1 }),
      na('The glass with the second chip went in the box marked HACHI. Nobody wrote that. It was just the box it was nearest.'),
      lb('no_chip'),
      en('empty')
    ]
  };

  /* 4 ------------------------------------------------------------------ */
  var ep4 = {
    id: 'the-train', title: 'Nana Gets on the Train', spoiler: true,
    tagline: 'Back to the snow. Back to the platform. Back to the choice.',
    premise: 'At the station where it all began, Nana doesn\'t stand and watch the train leave.',
    cast: ['nana', 'ren', 'nobu', 'yasu'], scene: 'platform',
    endings: {
      plus_one: { title: 'The Girlfriend of the Guitarist', caption: 'A very nice apartment. A very quiet voice. She left a note, and a mic she had stopped plugging in.' },
      two_stars: { title: 'Two Marquees', caption: 'They played opposite sides of the same city for ten years, and were late to each other\'s shows on purpose.' },
      stones: { title: 'Black Stones Forever', caption: 'The hall by the fish market, every Saturday. Beloved by forty people and a dog.' },
      second_train: { title: 'The Later Train', caption: 'A year on, three of them got on together. A girl across the aisle was crying about a boy.' }
    },
    steps: [
      sc('train-snow'), mu('sad'),
      le('Hey, Nana. You told me this one drunk, at three in the morning, and made me swear I never heard it. So: I never heard it, and here\'s how it goes.'),
      sc('platform'),
      na('Snow on the rails. A town with one good bakery and no reason to stay. Ren had a ticket and a guitar case and nothing else in the world he was going to mention.'),
      sr('ren', 'neutral', 'It leaves in six minutes.'),
      sl('nana', 'neutral', 'I can read a timetable.'),
      sr('ren', 'neutral', 'Yeah.'),
      na('That was the whole conversation, Nana. You told me it was the most anyone ever said to you.'),
      sr('yasu', 'neutral', 'I\'ll be in the car. I\'m very interested in the car. Take as long as you need.'),
      sr('nobu', 'sad', 'Nana! If you go, Black Stones is me and a bald guy! We\'re just a meeting!'),
      ch('The train is coming in. You have always told yourself what you\'d do here.', [
        { label: 'Get on the train. Don\'t look at Nobu.', flag: 'on_train', rel: { ren: 2, nobu: -2 }, remember: 'Nobu watched you go.', reply: [
          na('She said it took eleven steps and that she\'s been counting them ever since.') ], next: 'tokyo' },
        { label: 'Tell Ren: stay. Say the word, for once in your life.', flag: 'asked', rel: { ren: 1 }, remember: 'You asked. Out loud.', reply: [
          sl('nana', 'angry', 'Stay. There. I said it. Don\'t make that face, it took me nineteen years.') ], next: 'ren_stay' },
        { label: '[Say nothing]', silent: true, reply: [
          na('Your mouth wouldn\'t. The doors closed, and the snow went on as if nothing had happened. Snow has no manners at all.') ], next: 'stayed_behind' }
      ], 8),

      lb('stayed_behind'), sc('hometown'), mu('room'),
      na('She went back to the car. Yasu turned the heater up without being asked, and let two sets of lights go by before he spoke.'),
      sr('yasu', 'neutral', 'There\'s a train every day, Nana. Tokyo isn\'t going anywhere.'),
      ch('You can go after him, or you can go after what you were before him.', [
        { label: 'Book the rehearsal room. Black Stones plays Saturday.', flag: 'kept_band', rel: { nobu: 2, yasu: 1 }, reply: [
          sr('nobu', 'happy', 'YES! YES! I\'ve written eleven new songs and they\'re all about being left at a station!') ], next: 'hometown_years' },
        { label: 'Save for a ticket. One year. Then all of you go.', flag: 'plan', rel: { yasu: 2, nobu: 1 }, reply: [
          sr('yasu', 'smirk', 'I have looked at the numbers. If we eat nothing we can leave in eleven months.') ], next: 'hometown_years' }
      ]),

      lb('ren_stay'), mu('tension'),
      na('He looked at his ticket. He looked at the train. Takumi had already paid for the room.'),
      na('He\'d grown up in a shed by the harbour with nobody out looking for him. In all that time, nobody had once told him to stay anywhere.'),
      sr('ren', 'sad', 'They won\'t ask twice.'),
      sl('nana', 'neutral', 'I know. I\'m asking once.'),
      ch('He\'s going to stay, and you can see what it\'s costing him. Let him?', [
        { label: 'Take the ticket out of his hand. He\'s staying.', flag: 'kept_ren', rel: { ren: 1, nobu: 2 }, reply: [
          na('She said he let her take it. She says he looked relieved for almost the whole afternoon.') ], next: 'hometown_years' },
        { label: 'Laugh, push him on board. You only needed to hear yourself ask.', flag: 'freed', rel: { ren: 2 }, reply: [
          sl('nana', 'smirk', 'Go on, get out of here. I just wanted to see if I could say it.'),
          sr('ren', 'smirk', 'You\'re a nightmare.'),
          sl('nana', 'happy', 'Practise your chords. I\'ll be along to embarrass you.') ], next: 'race_to_tokyo' }
      ]),

      lb('tokyo'), sc('penthouse'), mu('room'),
      na('Ren\'s label found them a flat with a real bath. For a few months it was so happy that she forgot to be suspicious.'),
      sr('ren', 'neutral', 'There\'s a thing Thursday. Wives and girlfriends are at table nine.'),
      sl('nana', 'angry', 'I\'m sorry, what am I at?'),
      sr('naoki', 'happy', 'You\'re the one who sings, right? Ren never says! Ren never says anything! Do you want my prawn?'),
      ch('Six months in. A small flyer for an open mic. Ren is on tour.', [
        { label: 'Go. Sing. Start again under a stupid name.', flag: 'open_mic', rel: { ren: -1 }, remember: 'Ren found the flyer in your coat.', reply: [
          na('She signed in as somebody else. Four drunks and a mop heard her. The mop stopped moving.') ], next: 'tokyo_turn' },
        { label: 'Stay in. Ren needs one thing in his life to be easy.', flag: 'quiet', rel: { ren: 2 }, reply: [
          na('She made dinner. She told me that bit like a confession to a crime.') ], next: 'tokyo_turn' }
      ]),
      lb('tokyo_turn'),
      ju('quiet_end', { flag: 'quiet' }),
      sc('live-house'),
      sr('ren', 'neutral', 'You used a fake name.'),
      sl('nana', 'smirk', 'I wanted to win on my own.'),
      sr('ren', 'smirk', 'Did you?'),
      sl('nana', 'happy', 'Your drummer asked for my autograph, and then for my prawn back.'),
      en('two_stars'),
      lb('quiet_end'), sc('tokyo-night'), mu('sad'),
      na('Four years. I want you to know it was a beautiful apartment. She told me she stopped humming in the shower and couldn\'t say which day.'),
      en('plus_one'),

      lb('race_to_tokyo'), sc('hometown'), mu('room'),
      sr('yasu', 'neutral', 'Eleven months if we eat nothing. Nobu, stop eating.'),
      sr('nobu', 'sad', 'I have only had one bun!'),
      ju('later_train'),

      lb('hometown_years'), sc('hometown'), mu('room'),
      ju('later_train', { flag: 'plan' }),
      sr('nobu', 'happy', 'Forty-one people! A record! And the dog came back!'),
      sl('nana', 'smirk', 'The dog is the only one who understands the bridge.'),
      ju('stones_kept', { flag: 'kept_ren' }),
      na('Some Saturdays she looks up at the back door. Yasu takes the long way home on those nights and she doesn\'t thank him.'),
      en('stones'),
      lb('stones_kept'),
      sr('ren', 'neutral', 'Third on the setlist. Don\'t make it a thing.'),
      sr('ren', 'neutral', 'Trapnest is on the television.'),
      sl('nana', 'sad', 'Do you want me to turn it off?'),
      sr('ren', 'neutral', 'No. It\'s fine. The guitarist isn\'t as good as me.'),
      na('He said it every time, Nana said, and it was true, and she never knew whether he was saying it to make her feel better.'),
      en('stones'),

      lb('later_train'), sc('train-snow'), mu('title'),
      na('They got on together in the snow, the next winter, with one suitcase each and Nobu\'s rice cooker.'),
      ju('lt_no_plan', { notFlag: 'plan' }),
      sl('nana', 'neutral', 'Ren sends nothing. I\'ll be annoyed in person.'),
      lb('lt_no_plan'),
      sr('nobu', 'happy', 'Tokyo! Tokyo! Everyone, it\'s the Tokyo train!'),
      sl('nana', 'neutral', 'Nobu, this carriage has people in it.'),
      na('And across the aisle, a girl with a very large suitcase was crying into a very small sandwich, and looked up, and said:'),
      sr('hachi', 'sad', 'Sorry, is this seat free? I\'m sorry, I\'m crying, it\'s a long story. Do you want half of this?'),
      en('second_train')
    ]
  };

  /* 5 ------------------------------------------------------------------ */
  var ep5 = {
    id: 'reira-sings', title: 'Reira Sings for Herself', spoiler: true,
    tagline: 'The most beautiful voice in Japan has never ordered her own lunch.',
    premise: 'Reira walks out of the Trapnest rehearsal with no coat, no manager and no plan.',
    cast: ['reira', 'takumi', 'shin', 'yasu'], scene: 'studio',
    endings: {
      street: { title: 'The Ferry Singer', caption: 'A small town heard her on Thursdays. Nobody knew who she was, and for the first time that was the point.' },
      gilded: { title: 'The Next Album', caption: 'It was her best work. Everyone said so. He had the doors serviced that winter.' },
      duet: { title: 'Unbilled', caption: 'Two women, one mic, an unadvertised basement. No recording exists, and four hundred people lie about being there.' },
      wreck: { title: 'What It Cost', caption: 'Trapnest ended in a lawsuit. She won her name back and had nothing left to sing.' }
    },
    steps: [
      sc('studio'), mu('tension'),
      na('I wasn\'t there for this one, Nana. I made everyone tell it to me afterwards, separately, with food.'),
      sr('takumi', 'neutral', 'Again from the bridge. Reira, you are flat on the second phrase.'),
      sl('reira', 'neutral', 'I wasn\'t flat.'),
      sr('takumi', 'neutral', 'You were sad, which is the same note to an audience. Again.'),
      sr('naoki', 'happy', 'I thought it was nice! Is anyone having the rest of that sandwich? Hello?'),
      na('She had sung that bridge sixty-two times. She put down the headphones the way you put down something asleep.'),
      sl('reira', 'smirk', 'I am going outside.'),
      sr('takumi', 'neutral', 'There is no outside on the schedule.'),
      na('And Reira, who hadn\'t gone anywhere alone since she was sixteen, walked out of the door and discovered it was raining.'),
      sc('tokyo-night'), mu('sad'),
      sr('shin', 'shock', 'What are you doing here? You have no coat. You have no shoes that are for ground.'),
      sl('reira', 'happy', 'Shin! I took a train. Nobody was waiting at the other end. It just stops, and you get off, and no one says anything.'),
      sr('shin', 'neutral', 'Okay. Sit down, big sister. I\'ll get you an umbrella. You\'re worrying the convenience store.'),
      ch('She needs somewhere to go. Who does Shin call?', [
        { label: 'Call Yasu. He\'s known her longest.', flag: 'yasu_called', rel: { yasu: 2 }, remember: 'Yasu came. He always does. That\'s the problem.', reply: [
          sr('yasu', 'neutral', 'Reira. Get in. There\'s soup in the van. Don\'t ask why there\'s soup in the van.'),
          sl('reira', 'sad', 'You came so fast. You should stop doing that. It makes it hard for me.') ] },
        { label: 'Call nobody. Put her on the night bus with your pocket money.', flag: 'bus', rel: { shin: 2 }, remember: 'Shin gave her everything in his wallet.', reply: [
          sr('shin', 'neutral', 'It goes to the sea. I went once. It\'s very boring. You\'ll like it.'),
          sl('reira', 'happy', 'You\'re the nicest little brother I ever stole.') ] },
        { label: 'Take her to Room 707. Nana is awake.', flag: 'to_nana', rel: { nana: 2 }, remember: 'Nana doesn\'t usually open that door.', reply: [
          sr('nana', 'neutral', 'You\'re the enemy.'),
          sl('reira', 'sad', 'Yes. I\'m also quite wet.'),
          sr('nana', 'smirk', '...Towels are on the left. Don\'t touch the good glasses.'),
          sl('reira', 'sad', 'He says I\'m flat when I\'m sad.'),
          sr('nana', 'neutral', 'Same note. Sing it sad, then.') ] }
      ]),
      sc('penthouse'), mu('tension'),
      na('He found her in thirty-one hours, which he considered slow.'),
      sr('takumi', 'neutral', 'You are under contract for two more albums and a tour. Forty people get paid when you sing.'),
      sl('reira', 'sad', 'And when I don\'t?'),
      sr('takumi', 'neutral', 'Then I tell them why. The papers as well. Your nerves, your mother, and whose name is on every song you have sung.'),
      na('He had never once needed to raise his voice to her. He didn\'t start now.'),
      ch('He has laid it all out, and every word of it\'s true.', [
        { label: 'Refuse. Let him publish whatever he has.', flag: 'defied', rel: { takumi: -2 }, remember: 'Takumi doesn\'t forget a refusal.', reply: [
          sl('reira', 'smirk', 'Then print it. It\'s my life. I\'d be interested to read about it.') ], next: 'war' },
        { label: 'Bargain: one more album, then you let me go.', flag: 'bargain', rel: { takumi: 1 }, reply: [
          sl('reira', 'smirk', 'One more album. Then you open the door. What do I get if I sing it well?'),
          sr('takumi', 'smirk', 'I can work with that.'),
          na('He said it so kindly. Reira told me that was when she knew.') ], next: 'gilded_path' },
        { label: '[Say nothing]', silent: true, flag: 'silent', reply: [
          na('She looked out of his spotless window. He took her silence for an answer, because that was how it had always worked.') ], next: 'gilded_path' }
      ], 9),

      lb('war'), sc('newsstand'), mu('tension'),
      na('It was every cover by the weekend. They used an unkind photograph. Takumi had chosen it himself, and had an excellent eye.'),
      sr('yasu', 'sad', 'I can have an injunction by Tuesday. It wouldn\'t stop it. I\'ll do it anyway.'),
      ju('war_no_yasu', { notFlag: 'yasu_called' }),
      sl('reira', 'sad', 'You came so fast again. You really should stop. I keep letting you.'),
      lb('war_no_yasu'),
      ch('The band is coming apart around you. Do you take the fight public?', [
        { label: 'Fight it in court. Take your name back, whatever it burns.', flag: 'court', rel: { yasu: 1 }, reply: [
          sr('naoki', 'sad', 'Is it true I don\'t have a band anymore? No one tells me. Please. I have a mortgage now.') ], next: 'wreck_end' },
        { label: 'Vanish. Let him have the name. Keep the voice.', flag: 'vanish', rel: { shin: 1 }, reply: [
          sl('reira', 'happy', 'He can keep Reira. She was very expensive to run.') ], next: 'after_war' }
      ]),
      lb('after_war'),
      ju('no_addr', { notFlag: 'to_nana' }),
      na('A Koenji address came in Misato\'s handwriting, with a strawberry drawn on it. Nobody asked how Misato knew.'),
      lb('no_addr'),
      ju('basement', { flag: 'to_nana' }),
      ju('ferry'),

      lb('gilded_path'), sc('studio'), mu('sad'),
      na('The album took fourteen months. Then there was another clause. There\'s always one more, if somebody has written the document carefully.'),
      ju('gilded_end', { notFlag: 'to_nana' }),
      sr('nana', 'neutral', 'There\'s a basement in Koenji. No posters. Thursday. Come or don\'t, I\'m not your mother.'),
      ch('A note, passed along by Misato, who can\'t stop shaking. Takumi is three rooms away.', [
        { label: 'Go. Take the back stairs. In the wrong shoes.', flag: 'escaped', reply: [ na('It was the bravest thing she ever did, and she did it in her socks, which I\'m told runs in the family.') ] , next: 'stairs' },
        { label: 'Burn the note. Too many people get paid.', reply: [ na('She kept it folded in a lipstick case, and she never burned it, and she never went.') ], next: 'gilded_end' }
      ]),
      lb('stairs'),
      qt('RUN FOR THE SERVICE DOOR!', 3, 10,
        [ ju('basement') ],
        [ sr('takumi', 'neutral', 'Those are not your stairs, Reira. Come along. We have a sound check.'), ju('gilded_end') ]),

      lb('gilded_end'), sc('arena'), mu('sad'),
      na('Fifty-five thousand people stood up. She gave them everything. On the way out, Takumi held the door. He always did.'),
      en('gilded'),

      lb('basement'), sc('live-house'), mu('title'),
      sl('nana', 'smirk', 'You\'re going to be flat on the second phrase.'),
      sr('reira', 'happy', 'I\'m going to be sad on it. It\'s the same note.'),
      na('People who claim to have been there describe it badly. I cried into a stranger, and the stranger cried back.'),
      en('duet'),

      lb('ferry'), sc('hometown'), mu('room'),
      na('A harbour town. A diner where she gets the orders wrong and is forgiven. On Thursdays she sings to the ferry passengers, for coins.'),
      ju('ferry_no_bus', { notFlag: 'bus' }),
      na('It was the town at the end of that night bus. It was exactly as boring as he\'d promised, and she\'d never been so happy in her life.'),
      ju('ferry_join'),
      lb('ferry_no_bus'),
      na('She picked the town off a map with her eyes shut. It was the first thing she had ever chosen by accident.'),
      lb('ferry_join'),
      sr('shin', 'happy', 'I took the bus. It\'s still boring. You look terrible. Good. You look like you live here. I passed my exam.'),
      sl('reira', 'happy', 'Tell me everything. Slowly. I\'ve got nowhere to be.'),
      en('street'),

      lb('wreck_end'), sc('newsstand'), mu('sad'),
      na('She won. The ruling couldn\'t have been clearer. She read it alone in a lawyer\'s waiting room, and then there was nothing to do next.'),
      sr('yasu', 'sad', 'Have you eaten?'),
      sl('reira', 'sad', 'Please stop being so kind. I have just spent everything.'),
      en('wreck')
    ]
  };

  /* 6 ------------------------------------------------------------------ */
  var ep6 = {
    id: 'sunglasses', manga: true, title: 'Yasu Takes Off the Sunglasses', spoiler: true,
    tagline: 'He has driven everyone home. Where does he want to go?',
    premise: 'After the fourth crisis in a week, Yasu sits in a parked van and asks himself a question for the first time.',
    cast: ['yasu', 'nana', 'reira', 'hachi'], scene: 'road-van',
    endings: {
      told_her: { title: 'Said Out Loud', caption: 'She said no, and thanked him, and he has never felt so light or so bad at parking.' },
      miu: { title: 'Somebody Who Asks', caption: 'She made him a list of things he likes. It had four items and took a month.' },
      law: { title: 'Mr. Takagi, Attorney', caption: 'He went back to the law and took pro bono cases for runaway kids. The band still calls him at three a.m.' },
      shades: { title: 'Back On', caption: 'He drove everyone home, as usual. The van is very clean.' }
    },
    steps: [
      sc('road-van'), mu('room'),
      le('Hey, Nana. Did you ever see Yasu\'s eyes? I saw them exactly once and I felt like I had walked in on something. This is what I think happened that week.'),
      na('It was his fourth airport run in six days. He bailed out one guitarist and one reputation and he reminded Shin about a maths test.'),
      sr('shin', 'neutral', 'I didn\'t ask you to know about that.'),
      sl('yasu', 'neutral', 'No, you did not. Seven o\'clock. Bring a pencil.'),
      sr('nobu', 'sad', 'Yasu, have you got a minute? It\'s about Hachi, and my feelings, and also I may have lost the van keys.'),
      sl('yasu', 'neutral', 'They\'re in your other jacket. Your feelings I can look at on Thursday.'),
      na('Then the van was empty. It was four in the morning, in a car park, and nobody needed him for about eleven minutes.'),
      na('He took off the sunglasses. He doesn\'t know why. He looked at himself in the rear-view mirror and found a man he hadn\'t been briefed on.'),
      sl('yasu', 'sad', 'All right. What do you want.'),
      na('The engine ticked as it cooled. He tried again, the way you\'d with a witness.'),
      ch('For the first time, Yasu asks himself what he wants. What comes up first?', [
        { label: 'Nana. It has always been Nana.', flag: 'want_nana', rel: { nana: 1 }, reply: [ na('Well. He had suspected. He had filed it some years ago under matters not to be raised.') ] },
        { label: 'Someone who would notice if he stopped.', flag: 'want_seen', reply: [ na('That one embarrassed him so much that he put the sunglasses back on for a minute.') ] },
        { label: 'His old life. A desk. A door that closes.', flag: 'want_law', reply: [ na('He had been good at it. He had given it up to carry amplifiers, and he had never quite told anyone why.') ] }
      ]),
      sc('room-707'), mu('room'),
      sr('hachi', 'shock', 'Yasu? Your eyes! You\'ve got eyes! There are two of them! Why has nobody told me?'),
      sl('yasu', 'smirk', 'It is not widely known. I would appreciate your discretion.'),
      sr('hachi', 'happy', 'You look about nineteen! You look like a very tired baby! Are you all right? Sit down, I\'ll make you something.'),
      na('Nobody had asked him that since he was a boy. He sat down. The chair was too small for him. He found he couldn\'t speak for a moment.'),
      ch('Hachi is holding out a bowl. She\'s the only one who has ever asked.', [
        { label: 'Tell her. All of it, even the bit you filed.', flag: 'told_hachi', rel: { hachi: 2 }, remember: 'Hachi is terrible at keeping secrets. She\'ll try.', reply: [
          sl('yasu', 'neutral', 'I\'ve spent ten years being useful so that nobody would ask me this.'),
          sr('hachi', 'sad', 'Oh, Yasu. That\'s the saddest thing I ever heard and I once watched a dog wait for a bus.') ] },
        { label: 'Ask if she\'s eaten. Change the subject, gently.', flag: 'deflected', rel: { hachi: -1 }, reply: [
          sr('hachi', 'angry', 'That\'s what you always say! I\'m holding the bowl! I\'m obviously the one with the bowl!') ] }
      ]),
      sc('studio'), mu('tension'),
      na('Reira came by the studio. She always seemed to know, the way water knows where the crack is.'),
      sr('reira', 'smirk', 'You have your glasses in your hand. Should I be afraid?'),
      sl('yasu', 'neutral', 'I don\'t know yet.'),
      sr('reira', 'sad', 'I could ask you to take me away. You\'d do it, wouldn\'t you? You\'d look it up and do it properly.'),
      ch('She means it, or she might. You\'ve spent your life answering this phone.', [
        { label: 'Tell her no. Kindly. Finally.', flag: 'no_reira', rel: { reira: -1 }, remember: 'Reira had never heard you say that word.', reply: [
          sl('yasu', 'sad', 'No, Reira. I am very sorry. I have run out of being that.'),
          sr('reira', 'shock', 'Oh.'),
          sr('reira', 'happy', 'How strange. You look so much better when you\'re a bastard.') ] },
        { label: 'Say yes. Old habits have kind faces.', flag: 'yes_reira', rel: { reira: 2 }, reply: [ na('He called the airline. He had a very good memory for her passport number.') ], next: 'shades_end' },
        { label: '[Say nothing]', silent: true, flag: 'said_nothing', reply: [ na('He put the glasses back on, and she nodded as though he had answered, and in a way he had.') ], next: 'shades_end' }
      ], 7),
      sc('rooftop'), mu('sad'),
      ju('miu_scene', { flag: 'want_seen' }),
      ju('law_scene', { flag: 'want_law' }),
      ju('no_stairs', { notFlag: 'told_hachi' }),
      na('I wasn\'t there. I want that understood. I was on the fire stairs one floor down, with a bowl, being extremely not there.'),
      lb('no_stairs'),
      sr('nana', 'neutral', 'You\'ve been standing there for six minutes. Either jump or tell me what it is.'),
      sl('yasu', 'neutral', 'I find I am in love with you, Nana. It is not an emergency. I just wanted it in the record.'),
      na('She smoked for a while. Below, a train went by with all its lights on and nobody in it.'),
      sr('nana', 'sad', 'I know, you idiot. I\'ve known since we were seventeen.'),
      sr('nana', 'sad', 'I can\'t. You know why I can\'t. It\'s the same reason as always, and it\'s got a guitar.'),
      sl('yasu', 'smirk', 'I do know. I wanted to hear what it sounded like. Thank you for not being nice about it.'),
      sr('nana', 'neutral', 'Yasu. Take off those stupid things. I want to see what you look like when you\'re sad.'),
      en('told_her'),

      lb('miu_scene'), sc('live-house'), mu('room'),
      na('Miu, the actress from the agency dormitory, had been watching him carry things for a year. She had a direct way of standing in front of a person.'),
      sr('nobu', 'happy', 'She asked me what you like! I said drums and being sad in cars! Was that wrong?'),
      sl('yasu', 'neutral', 'Nobu, what did she say?'),
      sr('nobu', 'smirk', 'She said that\'s not a list. She said she\'s going to find out, and that you should clear your Tuesdays.'),
      na('Then she was simply there, in front of him. "Pears or plums? Don\'t think. Say one." He said pears. He had not known that.'),
      ch('You have no idea what you like on a Tuesday.', [
        { label: 'Clear your Tuesdays. Let somebody ask.', rel: { hachi: 1 }, reply: [
          sl('yasu', 'smirk', 'I looked into it. I appear to have one free Tuesday, in the year after next. I will move some things.') ], next: 'miu_end' },
        { label: 'Thank her and get back to work. There\'s a tour.', reply: [ na('He left a polite note. She wrote back one word, and it wasn\'t polite, and he kept it.') ], next: 'shades_end' }
      ]),
      lb('miu_end'), sc('tokyo-night'), mu('room'),
      na('It turned out that he likes pears, jazz nobody else can stand, and being driven. He had never once been driven.'),
      na('"Plums next week," she said. "Don\'t argue."'),
      en('miu'),

      lb('law_scene'), sc('tokyo-night'), mu('room'),
      na('The old firm was still there. He finished the training he\'d walked out of, at a desk beside boys ten years younger who called him sir.'),
      sr('shin', 'neutral', 'You look stupid in a tie. Who\'s going to carry the amps?'),
      sl('yasu', 'neutral', 'You are, Shin. You\'re growing.'),
      sr('shin', 'neutral', 'Why\'d you quit, anyway?'),
      sl('yasu', 'neutral', 'A girl sang in a bar. Sit down. I want to talk about your guardianship papers.'),
      sr('shin', 'shock', 'My what?'),
      sl('yasu', 'neutral', 'A kid your age should have somebody on a form. I filed it. You can tear it up. Your name is spelled right, at least.'),
      ch('He\'s gone completely still. He has never had a form.', [
        { label: 'Tell him he can come for dinner either way.', flag: 'home', rel: { shin: 2 }, reply: [
          sr('shin', 'sad', '...What are we having.'),
          sl('yasu', 'smirk', 'Nothing good. I do not cook. Seven o\'clock. Bring a pencil.') ], next: 'law_end' },
        { label: 'Let him have the room. Go and find some tea.', rel: { shin: 1 }, reply: [
          na('He was gone for quite a long time. When he came back, the form had been signed in the wrong box, and neither of them mentioned it.') ], next: 'law_end' }
      ]),
      lb('law_end'), sc('hometown'),
      na('It\'s a small office. There are always kids in the waiting room with a backpack and no one to call, and he always asks if they\'ve eaten.'),
      en('law'),

      lb('shades_end'), sc('road-van'), mu('sad'),
      ju('shades_plain', { notFlag: 'yes_reira' }),
      na('He drove her to the airport. She didn\'t look back. She has never had to.'),
      lb('shades_plain'),
      na('He put them back on at the first red light. By morning the van was clean, and the phone was ringing, and he answered it.'),
      en('shades')
    ]
  };

  /* 7 ------------------------------------------------------------------ */
  var ep7 = {
    id: 'finding-nana', manga: true, title: 'The Postcard', spoiler: true,
    tagline: 'A blank postcard. A glass with a chip in it.',
    premise: 'A postcard comes in the post with nothing on it but a very bad drawing of a strawberry. Hachi would like to know who drew it.',
    cast: ['hachi', 'nana', 'yasu', 'shin'], scene: 'hometown',
    endings: {
      home: { title: 'Room 707', caption: 'She came up the stairs in July, complaining. The second glass had been washed every week for ten years.' },
      letters: { title: 'Airmail', caption: 'She stayed by the sea. A letter came every month, one rude line long. Hachi has them all, in order.' },
      goodbye: { title: 'The Kind Stranger', caption: 'She let her go, and flew home, and told everyone that she had seen a very good singer in England.' },
      one_song: { title: 'One Night Only', caption: 'No one announced it. BLAST played one song in a pub with a sticky floor. Then she went back to work on Monday.' }
    },
    steps: [
      sc('room-707'), mu('sad'),
      le('Hey, Nana. This is the last one. I\'ve written you a letter every seventh of July for ten years, and I never had anywhere to send them. I\'m going to tell you how I found you. In my head, I always find you.'),
      na('Every seventh of July we still come up the stairs. Seven, oh-seven, and the one night those two stars are allowed to meet. It was Nobu\'s idea. Nobu brings too much food. Yasu checks the lease. Shin, who\'s on billboards now, takes out the rubbish.'),
      na('There are two glasses on the windowsill. I wash them both, every week. Don\'t say anything.'),
      sr('shin', 'neutral', 'You\'re doing the thing again, Hachi. With the cloth.'),
      sl('hachi', 'happy', 'It\'s a very dusty glass, thank you.'),
      na('Then Yasu put something on the table. He put it down the way he puts down bad news and good news, which is the same way.'),
      sr('yasu', 'neutral', 'It came to the old office, forwarded twice. There\'s no message. The postmark is a town in Cornwall.'),
      na('A postcard of a grey harbour. Nothing on the back. Only, in the corner, in ballpoint, very small, somebody had drawn a strawberry. Badly.'),
      sl('hachi', 'shock', 'Oh.'),
      sr('yasu', 'sad', 'It might be nothing. I want you to hear me say that. I\'ve been wrong about this four times.'),
      sl('hachi', 'sad', 'That strawberry has a face on it, Yasu. There\'s only one person alive who thinks that\'s funny.'),
      ch('You\'re going. The question is what you carry through that door.', [
        { label: 'Take the glass. The chipped one. Hers.', flag: 'glass', rel: { nana: 2 }, remember: 'You packed the glass in a sock.', reply: [
          na('I wrapped it in a sock and then another sock. The woman at airport security held it up to the light and looked at my face and gave it back.') ] },
        { label: 'Take Satsuki. She should meet the person her whole life is about.', flag: 'satsuki', rel: { nana: 1 }, remember: 'Satsuki has so many questions.', reply: [
          na('She was ten and she had read all my letters, which I had hidden in a rice tin, because she\'s my daughter and she looks in tins.'),
          sr('yasu', 'smirk', 'She\'s also sent me corrections. Yasu-san, page four, that wasn\'t a Tuesday.') ] },
        { label: 'Take nothing. Go as you are, and ask for nothing.', flag: 'empty', rel: { nana: 1 }, remember: 'You came with empty hands.', reply: [
          sr('yasu', 'neutral', 'No letters?'),
          sl('hachi', 'sad', 'They\'re for me, Yasu. I think I wrote them for me. I just want to see if she\'s eating.') ] }
      ]),
      sc('hometown'), mu('tension'),
      na('It rained the way it rains in that country, with no enthusiasm. I walked around for two days, showing a photograph to people who were polite about it.'),
      na('Then, on Thursday, I went past a pub with its door propped open. Someone inside was singing behind the noise of the dishes.'),
      na('It wasn\'t a performance. She was just singing while she stacked things, under her breath, a little flat from all the years of cigarettes.'),
      na('I had a whole speech. I had been working on it for ten years. It had three parts. I stood in the rain and I couldn\'t remember what any of them were.'),
      sc('backstage'), mu('sad'),
      na('Short hair, gone a little grey at the front. A tea towel over one shoulder. She had her back to me. She said something in English to someone, and laughed.'),
      na('Then she turned round to get a glass, and she saw me, and nothing happened to her face at all.'),
      sr('nana', 'neutral', 'We do not serve food after two.'),
      ch('Ten years. She\'s looking straight at you. Say something.', [
        { label: '"Have you been eating?"', flag: 'eating', rel: { nana: 3 }, remember: 'Of all the things you could have said.', reply: [
          sl('hachi', 'sad', 'Have you been eating?'),
          na('Her hand stopped on the glass. Just for a moment. Yasu would have been so proud of me.'),
          sr('nana', 'sad', '...You\'ve got old, Hachi.') ] },
        { label: '"Why? Ten years, Nana. WHY?"', flag: 'why', rel: { nana: -2 }, remember: 'You\'ve been holding that for a long time.', reply: [
          sl('hachi', 'angry', 'Ten years! I wrote to you! I washed your glass! Why would you do that to us? Why did you do that to ME?'),
          na('The pub went quiet in the English way, where everyone keeps drinking but stops chewing.'),
          sr('nana', 'angry', 'Not here.') ] },
        { label: '[Say nothing]', silent: true, flag: 'stood', rel: { nana: 1 }, reply: [
          na('Nothing. I stood there with rain coming off my nose, and I cried, in front of a man eating a pie. Nana finished drying the glass. Then she dried the next one.'),
          sr('nana', 'sad', 'You\'re dripping on my floor, you stupid dog.') ] }
      ], 10),
      na('She took me out the back, where the bins are, and lit a cigarette. Her hands were the same. I don\'t know why that was what undid me.'),
      sc('rain-rift'),
      sr('nana', 'neutral', 'Who sent you?'),
      sl('hachi', 'sad', 'You did. You drew a strawberry on a postcard. With a face.'),
      sr('nana', 'smirk', 'It\'s not a face. It\'s seeds.'),
      sl('hachi', 'happy', 'It\'s got a smile, Nana!'),
      sr('nana', 'sad', 'I was drunk. It was his birthday. I do that sometimes. I don\'t usually find a stamp.'),
      na('It was the first time either of us had come within a mile of him. We stood there for a bit, with him.'),
      ch('He\'s right there between you. She has never talked about it with anyone.', [
        { label: 'Say his name. Tell her you still have the voicemail.', flag: 'named_ren', rel: { nana: 2 }, remember: 'You said his name out loud.', reply: [
          sl('hachi', 'sad', 'Ren called me that night, Nana. By mistake, I think. Forty seconds. I never told you. I still have it.'),
          na('She didn\'t move. The cigarette burned down all on its own.'),
          sr('nana', 'sad', 'What does he say?'),
          sl('hachi', 'sad', 'Nothing. He just breathes. Then there\'s a lighter.'),
          sr('nana', 'sad', '...Yeah. That sounds like him.') ] },
        { label: 'Leave it alone. Tell her about everybody instead.', flag: 'spared', rel: { nana: 1 }, reply: [
          sl('hachi', 'happy', 'Nobu has got a very bad back and a very good inn. Yasu pretends to be retired. Shin is on the side of a bus.'),
          sr('nana', 'smirk', 'Does he still leave the room when it gets serious?'),
          sl('hachi', 'happy', 'He\'s a professional now. He leaves the room for money.') ] }
      ]),
      ju('satsuki_scene', { flag: 'satsuki' }),
      ju('glass_scene', { flag: 'glass' }),
      ju('turn'),

      lb('satsuki_scene'), sc('hometown'), mu('room'),
      na('She had been told to stay at the guest house. Naturally, she was standing at the end of the alley with a notebook.'),
      sr('hachi', 'shock', 'Satsuki! I said to stay!'),
      sl('nana', 'neutral', 'Who\'s the short one?'),
      sr('hachi', 'sad', 'That\'s my daughter. She\'s read all of your letters. The ones that I never sent. I\'m so sorry.'),
      na('Satsuki walked straight up to the most frightening woman I have ever loved, and looked up at her, all business.'),
      sl('nana', 'smirk', 'Well? What do you want, kid?'),
      na('And my daughter said that her mother cries every July, and that she\'d like to know if that was going to be fixed.'),
      sr('nana', 'shock', '...'),
      sr('nana', 'sad', 'She\'s yours, all right. She\'s got the exact same way of hitting you in the stomach.'),
      sl('nana', 'neutral', 'What do they call you, kid?'),
      na('She told her. Satsuki. I watched it go in.'),
      ju('name_said', { notFlag: 'spared' }),
      sr('hachi', 'sad', 'Nana, I should have told you before. About the name. It was Ren who...'),
      sl('nana', 'sad', 'I know who picked it.'),
      na('Of course you knew. You\'d known all along. You took it with you, along with everything else.'),
      ju('turn'),
      lb('name_said'),
      sl('nana', 'sad', 'He told me he\'d picked it. He was very pleased with himself. It\'s the only thing he ever named.'),
      ju('turn'),

      lb('glass_scene'), sc('backstage'), mu('sad'),
      na('I took it out of my bag. I took off one sock, and then the other sock. It took a very long time and neither of us could look away.'),
      sr('nana', 'shock', 'You brought a glass to England.'),
      sl('hachi', 'sad', 'It\'s been washed every week. The chip is still there. I didn\'t want you to think anyone had replaced it.'),
      sr('nana', 'sad', 'You idiot. You absolute... Do you know how stupid that is to carry on a plane?'),
      na('She took it and held it in both hands. It was so small in them. I had forgotten how small it was.'),
      ju('turn'),

      lb('turn'), sc('platform'), mu('tension'),
      na('The next morning, I went round to the pub and the shutter was down. The man with the pie said that she had asked for her wages.'),
      na('Yasu, from Tokyo, at an hour that was terrible for one of us:'),
      sr('yasu', 'sad', 'Hachi, listen to me. If she\'s run, it\'s not because of anything you did. It\'s what she does when it gets close.'),
      sl('hachi', 'angry', 'I KNOW what she does, Yasu! I\'ve been waiting for ten years at the place she did it!'),
      na('There\'s one little train out of that town. It goes along the sea. It leaves at nine.'),
      qt('RUN FOR THE PLATFORM!', 4, 12,
        [ re('You made it. In the wrong shoes.'), na('I don\'t run. I have never run. I ran. I got to that platform with one shoe undone and my lungs on the outside of my body.'), ju('platform_talk') ],
        [ na('The doors were closing when I came through the gate. It was just like every dream that I have ever had about you. It pulled away, and I stood and watched.'), ju('missed_train') ]),

      lb('missed_train'), mu('sad'),
      ju('platform_talk', { rel: { nana: 4 } }),
      na('I sat down on a bench and took out my notebook. I had come all this way. I wrote it all down, and left it with the man with the pie.'),
      ju('letters_end', { flag: 'named_ren' }),
      na('On the plane I decided what I\'d tell them. That I\'d seen a very good singer in England. That she was eating.'),
      en('goodbye'),

      lb('platform_talk'), mu('sad'),
      sr('nana', 'angry', 'You shouldn\'t be running at your age.'),
      na('She was on the bench with one bag. The train had come, and it stood there with its doors open, and she wasn\'t on it. I don\'t think she had known that until right then.'),
      sl('hachi', 'sad', 'You\'re not on the train.'),
      sr('nana', 'sad', 'I am aware.'),
      sr('nana', 'sad', 'I couldn\'t sing, Hachi. After. I opened my mouth and it was him. So I went somewhere nobody would ask me to.'),
      sr('nana', 'sad', 'If I\'d gone back, everyone would\'ve been so kind. I couldn\'t have stood it. You\'d all have been so kind.'),
      ch('This is the moment you\'ve rehearsed for ten years. What do you ask for?', [
        { label: 'Ask her to come home. Say it. Beg, if you have to.', flag: 'begged', rel: { nana: 1 }, reply: [
          sl('hachi', 'sad', 'Come home. I don\'t care if you\'re horrible. Please be horrible at me. In person. There\'s a room.') ], next: 'ask_home' },
        { label: 'Ask for nothing. Tell her she never owed you this.', flag: 'freed', rel: { nana: 2 }, reply: [
          sl('hachi', 'happy', 'You don\'t have to come back, Nana. I only wanted to know that you got to be somewhere. That\'s all. That was the whole speech.') ], next: 'ask_nothing' },
        { label: 'Ask her to sing. Once. Not for you, for him.', flag: 'sing', rel: { nana: -1 }, reply: [
          sl('hachi', 'sad', 'Nobu still carries the set list in his wallet. Yasu tunes a kit that nobody plays. One song. Then you can go.') ], next: 'ask_song' },
        { label: '[Say nothing]', silent: true, flag: 'no_words', reply: [
          na('Ten years of speech, and the doors of that little train beeped, and I only held out my hand. After a while she looked at it.'),
          sr('nana', 'sad', 'You really did forget all three parts.') ], next: 'ask_low' }
      ], 12),

      lb('ask_home'),
      ju('ask_low', { notFlag: 'eating' }),
      sr('nana', 'neutral', 'Is that fridge still there?'),
      sl('hachi', 'happy', 'It\'ll outlive all of us.'),
      sr('nana', 'smirk', 'Then somebody had better go and tell it I\'m coming. You\'re carrying this bag.'),
      ju('home_end'),
      lb('ask_low'),
      ju('home_kid', { flag: 'satsuki' }),
      ju('home_glass', { flag: 'glass' }),
      sr('nana', 'sad', 'I can\'t, Hachi. Ask me again next year. Maybe you\'ll have got better at it.'),
      ju('letters_end'),
      lb('home_kid'),
      sr('nana', 'sad', 'The kid asked if it was going to be fixed. ...Fine. You\'re carrying the bag.'),
      ju('home_end'),
      lb('home_glass'),
      sr('nana', 'sad', 'Is there anywhere in that terrible flat to put a glass?'),
      sl('hachi', 'happy', 'There\'s exactly one place.'),
      ju('home_end'),

      lb('ask_nothing'),
      ju('goodbye_end', { flag: 'why' }),
      sr('nana', 'sad', 'That was the speech?'),
      sl('hachi', 'happy', 'It was much longer on the plane.'),
      sr('nana', 'smirk', 'There\'s a post office here. It\'s very bad. I\'m told that they do deliver.'),
      ju('letters_end'),

      lb('goodbye_end'),
      sr('nana', 'sad', 'Thank you, Hachi. I\'d like to be someone you met once, in England.'),
      na('It was the kindest and the cruellest thing that anyone has ever said to me, and I said all right. I said all right, and I got on the train myself.'),
      en('goodbye'),

      lb('ask_song'),
      ju('song_yes', { rel: { nana: 5 } }),
      ju('song_no'),
      lb('song_yes'),
      sr('nana', 'angry', 'You came all this way for a gig.'),
      sl('hachi', 'sad', 'I came for you. I\'m just greedy.'),
      sr('nana', 'smirk', 'Tell the bald one there\'s a pub with a sticky floor. Thursday. If anyone films it, I\'ll find them.'),
      en('one_song'),
      lb('song_no'),
      sr('nana', 'sad', 'That\'s the one thing I haven\'t got left. I\'m sorry. Ask me for anything else. Go on. Ask me to write.'),
      ju('letters_end'),

      lb('letters_end'), sc('room-707'), mu('room'),
      na('It came in October, with a very bad stamp. A single line. It said that the rain was terrible and the tea was worse, and it was signed with a strawberry.'),
      sl('hachi', 'happy', 'It\'s got a face, Nana. I\'m telling you. It has a face.'),
      en('letters'),

      lb('home_end'), sc('room-707'), mu('title'),
      na('She came up the stairs in July, complaining about the stairs. Nobu dropped an entire tray of something. Shin came in from the kitchen and left again at a run.'),
      sr('yasu', 'neutral', 'You\'re late.'),
      sl('nana', 'smirk', 'I got held up.'),
      sl('nana', 'neutral', 'I\'m home.'),
      na('She said it like a swear word. She said it to the fridge.'),
      na('Then she went over to the windowsill, and she looked at the two glasses. She took the one with the chip.'),
      sr('nana', 'neutral', 'Well? It\'s empty. What kind of place are you running here, Hachi?'),
      sl('hachi', 'happy', 'Sit down. Sit down, I\'ll get something. Nana. Sit down. Have you eaten?'),
      en('home')
    ]
  };

  window.NG.WhatIf = { episodes: [ep2, ep3, ep4, ep5, ep1, ep6, ep7] };
})();
