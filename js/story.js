/* HEY, NANA - Room 707: the story. All writing original. A what-if, not canon. */
window.NG = window.NG || {};
(function () {
  'use strict';

  function scene(id) { return { type: 'scene', id: id }; }
  function music(id) { return { type: 'music', id: id }; }
  function letter(text) { return { type: 'letter', text: text }; }
  function nar(text) { return { type: 'narrate', text: text }; }
  function say(who, expr, text, side) {
    return { type: 'say', who: who, expr: expr, text: text, side: side || (who === 'hachi' ? 'left' : 'right') };
  }
  function choice(prompt, options) { return { type: 'choice', prompt: prompt, options: options }; }
  function label(name) { return { type: 'label', name: name }; }
  function jump(to, cond) { var j = { type: 'jump', to: to }; if (cond) j.if = cond; return j; }
  function mini(id) { return { type: 'minigame', id: id }; }
  function gig(song, venue, mode) { var g = { type: 'gig', song: song, venue: venue }; if (mode) g.mode = mode; return g; }
  function deal() { return { type: 'deal' }; }
  function polaroid(id) { return { type: 'polaroid', id: id }; }
  function keep(id) { return { type: 'keepsake', id: id }; }
  function stat(effects) { return { type: 'stat', effects: effects }; }
  function mem(id) { return { type: 'memory', id: id }; }

  var quiz = {
    intro: 'The train hasn\'t moved in a long time. Snow against the glass. The girl beside you hasn\'t said a word. Before she does: which Nana are you?',
    questions: [
      { q: 'You\'re leaving home for Tokyo. What\'s the reason?', answers: [
        { label: 'He\'s there. I just want to be near him. Is that so bad?', persona: 'pink' },
        { label: 'To make it. Nobody there is going to hand me anything, and that\'s fine.', persona: 'black' }
      ] },
      { q: 'What do you order?', answers: [
        { label: 'Coffee with milk. And don\'t you dare touch my strawberry.', persona: 'black' },
        { label: 'Whatever you\'re having! Oh, that looks good too. Can we share?', persona: 'pink' }
      ] },
      { q: 'You finally have some money. It goes on:', answers: [
        { label: 'Vivienne. One ring. I\'ll eat instant noodles for a month and wear it to bed.', persona: 'black' },
        { label: 'Vivienne, because she wears it! And a cake for when she comes home.', persona: 'pink' }
      ] },
      { q: 'Somebody you love says they\'re leaving.', answers: [
        { label: 'I don\'t stop them. I light a cigarette and I don\'t look at the door.', persona: 'black' },
        { label: 'I cry so hard I get the hiccups, and then I ask if I can come too.', persona: 'pink' }
      ] },
      { q: 'What does home look like?', answers: [
        { label: 'Somebody saying "welcome back", and dinner getting cold because we\'re talking.', persona: 'pink' },
        { label: 'A stage with the lights in my eyes. I\'ve never been sure about the other kind.', persona: 'black' }
      ] },
      { q: 'When life keeps going wrong, it\'s because:', answers: [
        { label: 'The Demon Lord. There\'s no other explanation. He\'s been at it for years.', persona: 'pink' },
        { label: 'I chose it. I\'d choose it again. Don\'t feel sorry for me.', persona: 'black' }
      ] },
      { q: 'Your friend is crying on the floor of your apartment at 3 a.m.', answers: [
        { label: 'Say "idiot", sit down beside her, and stay until it gets light.', persona: 'black' },
        { label: 'Cry too, obviously! Then make toast. Everything is a little better with toast.', persona: 'pink' }
      ] }
    ],
    results: {
      black: { title: 'YOU ARE NANA', text: 'You walk ahead so nobody sees your face. You want the top more than you want to be safe, and you\'d never admit how much you need someone to wait up for you. Stand up straight. The stage is yours.' },
      pink: { title: 'YOU ARE HACHI', text: 'You fall too fast, you cry too easily, and you love people with your whole body. Everyone underestimates what that takes. You\'re the reason any of them have somewhere to come home to.' }
    }
  };

  var chapters = [
    {
      id: 'prologue', title: 'Seat 7, Seat 8', steps: [
        music('room'),
        scene('train-snow'),
        letter('Hey, Nana.\n\nI still have the ticket stub from that train. It has gone soft from being unfolded.\n\nI take it out more than I should. It was snowing, and I was twenty, and I honestly believed that if you loved someone enough, everything would work out.\n\nI\'ve started writing to you again. Junko says I should stop. She says it kindly.\n\nBut somewhere along the way our story got left open, right at the part that hurts, and nobody came back to finish it. So I\'m going back to the beginning. I\'d like you to come with me, whoever you are. There\'s a seat free.'),
        nar('March. The Shinkansen to Tokyo. The snow has been coming down so hard that the train has stopped between stations.'),
        say('hachi', 'sad', 'Stopped again... I knew it. Everything was going too well. It\'s the Demon Lord, I just know it.'),
        say('hachi', 'happy', 'I\'m going to Tokyo to be with my boyfriend! His name is Shoji. Sorry, you didn\'t ask. I talk when I\'m nervous.'),
        nar('The girl in the next seat is in black from collar to boots. There\'s a guitar case between her knees and a heavy silver ring on her finger.'),
        say('nana', 'neutral', 'You\'re loud.'),
        say('hachi', 'shock', 'I\'m sorry! Everyone says so! Um, wow, your ring is so cool. Is that real Vivienne?'),
        say('nana', 'smirk', 'Armour ring. Cost me a month of eating.'),
        keep('ring'),
        say('hachi', 'happy', 'I\'m Nana, by the way! Nana Komatsu!'),
        say('nana', 'neutral', '...Nana.'),
        say('hachi', 'happy', 'Yes! Nana!'),
        say('nana', 'smirk', 'No. Me. I\'m Nana. Osaki Nana.'),
        say('hachi', 'shock', 'EHHH?! The same name! And we\'re the same age?! On the same train, in this snow?! This has to be fate!'),
        say('nana', 'smirk', 'Hah. You really say that out loud, huh.'),
        { type: 'quiz' },
        nar('Snow slides from the window. Somewhere up ahead, the line begins to clear.'),
        choice('She\'s watching the dark outside as if Tokyo owes her something.', [
          { label: 'Ask what the guitar is for.', effects: { bond: 1, fame: 1 }, reply: [
            say('nana', 'neutral', 'I\'m going to get to the top. That\'s all. That\'s the whole plan.'),
            say('hachi', 'happy', 'That\'s so cool! I\'ll buy your first record! I\'ll tell everyone I sat next to you!')
          ] },
          { label: 'Tell her about Shoji. And your family. And everything.', effects: { bond: 2 }, flag: 'told-life-story', reply: [
            nar('It takes until the next station. Nana never once tells her to stop.'),
            say('nana', 'smirk', 'You give all that to everyone you meet? Be careful, kid.'),
            say('hachi', 'sad', 'Kid? We\'re the same age!')
          ] },
          { label: 'Stop talking, and offer her your other rice ball.', effects: { bond: 1, harmony: 1 }, reply: [
            say('nana', 'neutral', '...Thanks.'),
            nar('She eats it slowly, like someone who hasn\'t been handed many things.')
          ] }
        ]),
        say('nana', 'smirk', 'See you, other Nana. Don\'t go crying on any more strangers.'),
        say('hachi', 'happy', 'I can\'t promise that!'),
        polaroid('seat-7-8'),
        mem('fate'),
        stat({ bond: 1 })
      ]
    },
    {
      id: 'room-707', title: 'Room 707', steps: [
        music('room'),
        scene('tokyo-night'),
        letter('Hey, Nana.\n\nTokyo is so big. I got lost twice on the way to the real estate office.\n\nIt doesn\'t seem possible, does it, that out of all those millions of doors, we\'d both knock on the same one.\n\nI believed in fate back then. I\'m not going to apologise for it.'),
        scene('room-707'),
        nar('An old apartment building. Seventh floor. The door says 707. The rent is far too low for how nice it is.'),
        say('hachi', 'happy', 'Waa, look at the light! There\'s even a bathtub! I could cook for Shoji here, and put curtains up, and...'),
        nar('Behind her, the door opens. Black coat. Guitar case.'),
        say('nana', 'shock', '...You\'re kidding.'),
        say('hachi', 'shock', 'NANA?! The train Nana?! It really IS fate! Or the Demon Lord! But in a good mood!'),
        say('nana', 'neutral', 'I\'m taking this place.'),
        say('hachi', 'sad', 'But I saw it first... by four minutes... and I can\'t afford it alone...'),
        say('nana', 'smirk', 'Yeah. Me neither.'),
        nar('And that was how it started. Two people named seven, in room seven-oh-seven.'),
        say('nana', 'smirk', 'You follow people around and cry when they leave. Like Hachiko. I\'m calling you Hachi.'),
        say('hachi', 'shock', 'After the DOG?!'),
        say('hachi', 'happy', 'The loyal one, at Shibuya, who waited and waited...? ...Okay! I\'ll be Hachi!'),
        nar('A shop by the station. Two glasses on a shelf, with strawberries all over them.'),
        choice('Nana is holding one up to the light, pretending she doesn\'t care.', [
          { label: '"Let\'s get both! One each! It\'s our apartment now!"', effects: { bond: 2 }, flag: 'matching-glasses', reply: [
            say('nana', 'neutral', 'They\'re ridiculous.'),
            say('nana', 'smirk', '...I\'ll carry mine.')
          ] },
          { label: '"Can you lend me the money? I\'ll pay you back after payday, I swear."', effects: { bond: 1, scandal: 1 }, reply: [
            say('nana', 'smirk', 'You came to Tokyo with no money and no plan. How are you still alive?'),
            say('hachi', 'happy', 'People are very nice to me!')
          ] }
        ]),
        keep('cups'),
        polaroid('strawberry-glasses'),
        mem('stairs'),
        say('nana', 'neutral', 'Strawberry cake and coffee with milk. That\'s all I need to be happy. And a stage. And my cigarettes.'),
        say('hachi', 'happy', 'That\'s a lot, actually! But leave the cake to me! I\'m really good at this one thing!'),
        mini('shortcake'),
        keep('cake'),
        scene('studio'),
        music('tension'),
        nar('A rental rehearsal room, smelling of cables and instant coffee. This is where Nana brought her.'),
        say('nobu', 'happy', 'So you\'re Hachi-chan! Nana told me about you! I\'m Nobu, guitar! We came from the same town!'),
        say('hachi', 'happy', 'Nana talked about me?!'),
        say('nobu', 'happy', 'She said "there\'s a weird girl in my apartment". From Nana, that\'s basically a love song!'),
        say('yasu', 'neutral', 'Yasu. Drums. If anyone in this city gives you trouble, tell me.'),
        say('hachi', 'shock', 'Um, are you... yakuza...?'),
        say('yasu', 'smirk', 'Lawyer. Used to be, anyway. It frightens people more.'),
        keep('shades'),
        nar('The bass amp is the only thing nobody is standing beside. Their bassist left a long time ago. Nobody says his name.'),
        say('shin', 'neutral', 'Excuse me. I heard you need a bassist. I\'m Shin. I\'m fifteen, but I can play.'),
        say('nana', 'smirk', 'Plug in, then. If you\'re bad I\'m throwing you down the stairs.'),
        nar('He isn\'t bad. Yasu counts them in without being asked. For the first time in a while, Nana laughs out loud.'),
        keep('bass'),
        say('nobu', 'happy', 'We\'re back! Black Stones are back! Blast, baby! Hachi-chan, you\'re our good luck charm!'),
        scene('live-house'),
        say('nana', 'neutral', 'Stay near the front, Hachi. Don\'t blink.'),
        gig('last-train', 'A Tiny Live House, Tokyo'),
        say('hachi', 'sad', 'I didn\'t know. I didn\'t know that\'s what you sounded like. I cried so much my eyes are stuck.'),
        say('nana', 'smirk', 'Idiot. Go wash your face. We\'re getting ramen.'),
        polaroid('first-gig'),
        mem('kitchen-stage'),
        stat({ fame: 1 })
      ]
    },
    {
      id: 'love-disasters', title: 'Love at First Sight', steps: [
        music('room'),
        scene('jackson-hole'),
        letter('Hey, Nana.\n\nYou used to say that I fall in love the way other people catch colds.\n\nI\'d like it on the record that I was always very sincere about it. Every single time.\n\nI think I just wanted so badly for someone to look at me and stay.'),
        nar('Jackson Hole. Burgers, a booth, and Junko, who has known Hachi for a very long time.'),
        say('junko', 'neutral', 'So. You moved to Tokyo for Shoji, and how often have you actually seen him this month?'),
        say('hachi', 'sad', 'He\'s very busy! He has art school! And part-time work! Junko, stop looking at me like that...'),
        say('kyosuke', 'happy', 'Don\'t mind her. She worries, so it comes out as interrogation. Eat something, Hachi.'),
        say('junko', 'smirk', 'Kyosuke\'s too soft on you. And you aren\'t cursed, you know. You just don\'t have any brakes.'),
        say('hachi', 'angry', 'It\'s the Demon Lord, Junko! Every time I\'m happy he comes along and takes it away!'),
        scene('tokyo-night'),
        music('sad'),
        nar('It was always going to be a girl from his part-time job. It was always going to be Hachi who found out by accident.'),
        say('shoji', 'sad', 'I\'m sorry. I didn\'t mean for it to happen. I\'m seeing Sachiko.', 'right'),
        say('hachi', 'sad', 'But I came all this way. I came all this way for you.'),
        say('shoji', 'sad', 'I know. I know you did.', 'right'),
        mem('no-luck'),
        scene('room-707'),
        say('nana', 'neutral', 'You\'re back early.'),
        say('hachi', 'sad', 'Nanaaa...!'),
        say('nana', 'neutral', '...Who do I have to hit?'),
        say('hachi', 'sad', 'Nobody! I made this big cake and now he\'s, and I, and it\'s all the Demon Lord\'s...'),
        say('nana', 'smirk', 'Give me a fork. Sit down. Cry while you eat, it\'s more efficient.'),
        music('room'),
        nar('Three days later, Junko dragged her out for air. Hachi saw someone across the room, and her heart forgot everything it had learned.'),
        say('hachi', 'happy', 'Junko. Junko. He held the door for that old lady. I think this one is different.'),
        say('junko', 'neutral', 'Of course you do.'),
        mini('redflag'),
        scene('room-707'),
        say('nana', 'smirk', 'So? How was your future husband?'),
        say('hachi', 'sad', 'He had a girlfriend. It\'s always like this...'),
        choice('Nana is on the floor with a coffee, waiting. She hasn\'t asked.', [
          { label: '"I\'m scared there\'s nothing to me except who I\'m in love with."', effects: { bond: 2, harmony: 1 }, flag: 'honest-with-nana', reply: [
            say('nana', 'neutral', 'You idiot. Who do you think this place feels like, when you\'re not in it?'),
            say('hachi', 'sad', 'Nana... that\'s the nicest thing you\'ve ever said...'),
            say('nana', 'smirk', 'Don\'t get used to it.')
          ] },
          { label: 'Tell her you\'ve started keeping a record of the Demon Lord\'s crimes.', effects: { bond: 1, fame: 1 }, flag: 'demon-crusade', reply: [
            nar('It runs to a second notebook. Nana reads every page and asks for clarification on item nineteen.'),
            say('nana', 'smirk', 'He\'s a busy guy, this Demon Lord.')
          ] },
          { label: '"I\'m fine! Really! Do you want some toast?"', effects: { scandal: 1 }, reply: [
            say('nana', 'neutral', 'That\'s your fifth piece of toast, Hachi.'),
            say('hachi', 'sad', '...It\'s really good toast.')
          ] }
        ]),
        scene('tokyo-night'),
        nar('Sale day. A line around the block at dawn. Nana has brought a thermos, a folding stool and the eyes of a sniper.'),
        say('nana', 'neutral', 'When life\'s bad, you buy something you can\'t afford and you wear it till it\'s your fault. Ready?'),
        say('hachi', 'shock', 'Nana, that lady just elbowed a nun!'),
        say('nana', 'smirk', 'Good technique. Stay behind me. The whole band needs stage clothes and I\'m not letting Nobu pick.'),
        mini('fitcheck'),
        say('hachi', 'happy', 'The rocking horse shoes? On me? I\'m so tall! Look at me! I can see over people! I\'m falling over!'),
        say('nana', 'smirk', 'You look like a giraffe at its first wedding. Buy them.'),
        keep('shoes'),
        say('nobu', 'happy', 'Hachi-chan! Are you okay? I heard! I brought oden! Is oden okay? I can get different oden!', 'right'),
        say('hachi', 'happy', 'Nobu, you\'re so kind. You\'re like a big golden dog.'),
        say('nobu', 'sad', 'Right! Yeah! A dog! Thanks!', 'right'),
        nar('Nana, watching this, drinks her coffee very slowly and says nothing at all.'),
        say('nana', 'smirk', 'New song tonight. Dumb, fast and bright. It\'s your fault. Come and take the blame.'),
        scene('live-house'),
        gig('strawberry-glass', 'The Same Tiny Room, More Sweat'),
        say('nobu', 'happy', 'They knew the chorus the second time round! And Nana smiled! I saw it! Yasu, tell them I saw it!'),
        say('yasu', 'smirk', 'He saw it.'),
        polaroid('red-flag'),
        polaroid('burger-summit'),
        mem('dream-again')
      ]
    },
    {
      id: 'ren-past', title: 'Padlock', steps: [
        music('sad'),
        scene('tokyo-night'),
        letter('Hey, Nana.\n\nFor months you never said his name.\n\nI learned it from a poster. That must be what it\'s like, when someone you loved gets famous. You go out to buy milk and there he is, nine feet tall, looking straight through you.\n\nI didn\'t know how to help you back then. I still think about that.'),
        nar('A billboard over the crossing. TRAPNEST. The guitarist looks down over all of Tokyo, a padlock at his throat.'),
        say('hachi', 'happy', 'Nana, look, it\'s Ren Honjo! I love Trapnest! Isn\'t he the coolest person you\'ve ever...'),
        say('nana', 'neutral', 'Yeah. He used to play bass in my band.'),
        say('hachi', 'shock', 'EHHH?!'),
        scene('studio'),
        nar('Nana walks ahead without another word. It\'s Yasu who finally sits down beside Hachi, and takes off his sunglasses to clean them.'),
        say('yasu', 'neutral', 'They lived together, back home. Then Trapnest asked him to come to Tokyo.'),
        say('yasu', 'neutral', 'He asked her to go with him. She told him she\'d come when she could stand next to him. Not behind him.'),
        say('hachi', 'sad', 'And she\'s been waiting all this time...?'),
        say('yasu', 'neutral', 'Don\'t tell her I told you. She\'ll say she isn\'t. Just keep making that cake.'),
        keep('lighter'),
        scene('room-707'),
        nar('Late. A knock nobody expected. He fills the doorway, and then stands there as if he doesn\'t trust the floor.'),
        say('ren', 'neutral', 'Saw your name on a flyer.', 'left'),
        say('nana', 'angry', 'You\'ve still got it on.'),
        say('ren', 'neutral', 'Yeah.', 'left'),
        say('nana', 'neutral', 'Stupid thing. It was a joke. Sid Vicious, and you were twenty.'),
        say('ren', 'sad', 'I know what it was.', 'left'),
        nar('Hachi has been holding the same cup in the kitchen for eleven minutes. She is absolutely not listening.'),
        mini('padlock'),
        keep('padlock'),
        scene('rooftop'),
        choice('Afterwards Nana stands out on the roof in the cold, cigarette gone out in her hand.', [
          { label: 'Bring a blanket. Say nothing. Stand beside her.', effects: { bond: 3 }, flag: 'blanket', reply: [
            nar('Neither of them speaks for about an hour. It is the best conversation they\'ve ever had.'),
            say('nana', 'sad', '...You didn\'t see anything, Hachi.'),
            say('hachi', 'sad', 'I didn\'t see anything.')
          ] },
          { label: 'Ask her straight: "Are you going to go back to him?"', effects: { bond: 1, harmony: 1 }, flag: 'asked-about-ren', reply: [
            say('nana', 'neutral', 'If I go now, I\'m just his girl from back home. I\'ll go when I can look him in the eye.'),
            say('hachi', 'happy', 'Then we\'ll have to get you a really, really big stage!')
          ] },
          { label: 'Say Trapnest\'s new single isn\'t even that good.', effects: { bond: 1, scandal: 1 }, reply: [
            say('nana', 'smirk', 'It\'s great, and you\'re a terrible liar.'),
            say('nana', 'happy', '...Say it again, though.')
          ] }
        ]),
        polaroid('padlock'),
        mem('stray-cat'),
        scene('live-house'),
        music('tension'),
        say('demon', 'smirk', 'Good evening. Such a sad song. Shall we make it harder? I have brought paperwork.'),
        say('hachi', 'shock', 'THAT\'S HIM! I TOLD everyone! It\'s all in the notebook!'),
        say('demon', 'happy', 'And what a charming glass you\'ve brought. Strawberries! Let\'s see how closely you\'ve been paying attention.'),
        say('nana', 'neutral', 'Hachi, who are you talking to?'),
        say('hachi', 'angry', 'He\'s got my CUP, Nana! Don\'t look at me like that! I\'m getting it back!'),
        mini('cups'),
        deal(),
        gig('padlock', 'A Bigger Room, Colder Air'),
        say('shin', 'neutral', 'She held that last note until the lights hummed. I forgot to come back in. Nobody noticed.'),
        stat({ fame: 1, harmony: 1 })
      ]
    },
    {
      id: 'tabloids', title: 'Front Page', steps: [
        music('tension'),
        scene('newsstand'),
        letter('Hey, Nana.\n\nDo you know what the scariest thing in Tokyo is? A man with a long lens and a mortgage.\n\nOur faces went up on the racks one Tuesday, somewhere between a diet and a horse race. I bought thirty copies. I don\'t know why. I think I thought that if I bought them all, it would stop.'),
        nar('This morning\'s newsstand, in order of how much screaming it caused.'),
        nar('WEEKLY SHOCK: "BLAST VOCALIST AND TRAPNEST GUITARIST: THE LOVE THEY HID!! SOURCE: A MAN NEAR A CAR!!"'),
        nar('TOKYO EXPOSED: "ROCK STAR SEEN BUYING STRAWBERRIES AND A CAKE BOX. WHO IS IT FOR? PAGES 4-19."'),
        nar('HEARTBREAK DAILY: "WHO IS THE MYSTERY ROOMMATE, AND WHY IS SHE CRYING IN EVERY PHOTO?"'),
        say('hachi', 'shock', 'I\'m crying in every photo!'),
        say('misato', 'happy', 'I have all of them pressed in a binder! Nana-san looks so beautiful when she\'s being accused of things!'),
        say('hachi', 'sad', 'Misato-chan, there\'s an arrow pointing at my head. It says "her??"'),
        say('misato', 'smirk', 'It\'s a very nice arrow.'),
        scene('studio'),
        say('yasu', 'neutral', 'Everybody sit. We say nothing and we confirm nothing. And nobody signs that record deal till I\'ve read it.'),
        say('nobu', 'happy', 'It\'s only eighty pages! How bad could it be?'),
        say('yasu', 'neutral', 'Page two says your soul is "non-refundable". Hachi, get a pen. You\'re helping.'),
        mini('objection'),
        say('yasu', 'smirk', 'Better. Page sixty-one now reads "the band keeps its own kidneys". I call that a win.'),
        say('nobu', 'sad', 'That reporter was really nice to me, though! She asked how I was!'),
        say('yasu', 'neutral', 'Nobu. You stay in the van.'),
        say('shin', 'neutral', 'I got asked if I\'m actually fifteen. I said I\'d have to check with my lawyer.'),
        say('yasu', 'smirk', 'Good kid.'),
        keep('drumsticks'),
        mini('scandal'),
        scene('room-707'),
        nar('That night someone knocks at 707, and it isn\'t Ren. He takes off his coat as if the apartment has been expecting him.'),
        say('takumi', 'smirk', 'Takumi Ichinose. I look after Trapnest. You must be the one who cooks.'),
        say('hachi', 'shock', 'B-b-bassist Takumi?! Real Takumi?! In my kitchen?! I\'m wearing an apron with a duck on it!'),
        say('takumi', 'smirk', 'So you are. Don\'t change. It\'s the first honest thing I\'ve seen all week.'),
        say('hachi', 'happy', 'Nana... I think my heart just did something terrible.'),
        say('nana', 'angry', 'Hachi. No. Absolutely not. That guy is the Demon Lord.'),
        choice('A reporter corners Nana outside the venue. Forty flashes. She glances back at you.', [
          { label: 'Step in front of her and answer every question yourself, badly.', effects: { bond: 2, scandal: -2 }, flag: 'hachi-defence', reply: [
            nar('The evening edition: "MYSTERY ROOMMATE SPEAKS FOR NINETY MINUTES ABOUT CAKE. EDITORS EXHAUSTED."'),
            say('nana', 'happy', 'That was the dumbest thing I\'ve ever seen. Thanks, Hachi.')
          ] },
          { label: 'Let Nana handle it. She has a mic and a mouth.', effects: { fame: 2, scandal: 2 }, flag: 'nana-mouth', reply: [
            say('nana', 'smirk', 'You want a quote? Spell my name right and buy the record.'),
            nar('It\'s the front page by morning. Sales double. So do the men in the bushes.')
          ] },
          { label: 'Get everyone out through the kitchen. Yasu has the van.', effects: { harmony: 2 }, reply: [
            say('yasu', 'smirk', 'Watch the fryer. Nobody got a shot. Good call, Hachi.'),
            say('nobu', 'happy', 'I\'ve never felt so famous as when I was hiding in that bin!')
          ] }
        ]),
        scene('live-house'),
        music('tension'),
        say('nana', 'smirk', 'They want to know where we live? Fine. This one\'s called Room 707.'),
        deal(),
        gig('room-707', 'Packed to the Fire Exits'),
        say('hachi', 'happy', 'The whole crowd sang our room number! Seven, oh, seven! Our actual address! Wait...'),
        polaroid('front-page'),
        mem('shiny'),
        stat({ fame: 1, scandal: 1 })
      ]
    },
    {
      id: 'van', title: 'Five People, One Van', steps: [
        music('room'),
        scene('road-van'),
        letter('Hey, Nana.\n\nNobody ever remembers the summer of the van. They remember the arenas.\n\nI remember you asleep with your mouth open, against a bag of cables, with a rice ball in your hand.\n\nIf I could go back to any day at all, I don\'t think I\'d pick one of the famous ones.'),
        nar('Blast\'s first tour. Eleven cities, one van, no air conditioning, and a drummer who won\'t let anybody else hold the map.'),
        say('yasu', 'neutral', 'It\'s a left.'),
        say('nobu', 'happy', 'It\'s a right! I grew up around here! Yasu, trust me, I know these roads!'),
        nar('It was not a right.'),
        say('nana', 'smirk', 'Hachi. Remind me why you\'re on tour with us.'),
        say('hachi', 'happy', 'I made lunches! Also I couldn\'t stay in the apartment by myself. There was a noise. It was the fridge.'),
        say('nana', 'smirk', 'So you crossed half of Japan to get away from a fridge.'),
        say('shin', 'neutral', 'Smoke is bad, right? I\'m fifteen. I don\'t know about cars. But it seems bad.'),
        nar('The van makes a noise like an old man remembering something, and stops forever.'),
        say('yasu', 'neutral', 'Everybody out. Nobu. Where exactly did your "right" take us?'),
        say('nobu', 'sad', '...My parents\' inn is about twenty minutes from here. Forget I said that. Please forget I said that.'),
        say('nana', 'smirk', 'Nobu. Say that again, slower.'),
        scene('inn'),
        nar('Nobu\'s family inn. Wooden corridors, paper screens, and a mother who looks at five exhausted musicians and sees staff.'),
        say('nobu', 'sad', 'She says we eat for free if we work the dinner shift. She also says I have to wear the coat. Don\'t laugh, Yasu.'),
        say('yasu', 'neutral', 'I wasn\'t going to laugh. I\'m taking a photograph.'),
        mini('inn'),
        scene('inn'),
        nar('The inn goes quiet after ten. The van won\'t be fixed until morning. Everyone has wandered off somewhere.'),
        choice('It\'s your one free night of the whole tour. Who do you go and find?', [
          { label: 'Yasu, out on the veranda with the van manual.', effects: { harmony: 2 }, flag: 'night-yasu', reply: [
            say('hachi', 'happy', 'Yasu, why did you stop being a lawyer? You could be so rich!'),
            say('yasu', 'neutral', 'I was good at it. People came in crying and I sent them a bill. Then Nana sang at a bar, and nobody got a bill.'),
            say('hachi', 'sad', 'Do you ever take those sunglasses off?'),
            say('yasu', 'smirk', 'When Nobu plays sad songs. It\'s the only way to be sure he can\'t see me.')
          ] },
          { label: 'Shin, in the kitchen, with a school textbook and no expression.', effects: { harmony: 1, bond: 1 }, flag: 'night-shin', reply: [
            say('shin', 'neutral', 'Correspondence course. If I fail maths they tell someone. I\'m not sure who.'),
            say('hachi', 'happy', 'Leave it to me! I went to... I mean, I used to... what\'s a cosine?'),
            say('shin', 'neutral', 'That\'s all right, Hachi-san. You brought food. Nobody usually checks whether I\'ve eaten.'),
            nar('She makes him a second dinner. They both fail the practice paper. It\'s a lovely evening.')
          ] },
          { label: 'Nobu, in the garden, playing very quietly so his mother won\'t hear.', effects: { harmony: 1, fame: 1 }, flag: 'night-nobu', reply: [
            say('nobu', 'sad', 'She still sets a place for me, you know. She thinks this band thing ends next spring.'),
            say('hachi', 'happy', 'She kept your coat, Nobu! I think that means she misses you, not that she doesn\'t believe in you!'),
            say('nobu', 'happy', '...Yeah? You think? Hachi-chan, how do you always make it sound that simple?')
          ] },
          { label: 'Nana, sitting on the bathhouse steps with wet hair and a bottle of coffee milk.', effects: { bond: 2 }, flag: 'night-nana', reply: [
            say('nana', 'neutral', 'My grandmother used to buy these. I told her they were for kids. I drank one every day.'),
            say('hachi', 'sad', 'Do you miss her?'),
            say('nana', 'smirk', 'Hachi, sit down and shut up and drink your milk.'),
            nar('It\'s the first time she has ever saved a bottle for someone else. Neither of them mentions it.')
          ] }
        ]),
        scene('road-van'),
        say('yasu', 'neutral', 'Van\'s fixed. It\'s a left, by the way. It was always a left.'),
        say('nobu', 'happy', 'My mother says come back any time! She also says Shin is the best employee she\'s had in forty years!'),
        say('shin', 'smirk', 'I\'ve been offered a pension.'),
        polaroid('van'),
        mem('summer'),
        stat({ harmony: 1 })
      ]
    },
    {
      id: 'rise', title: 'Birdcage', steps: [
        music('room'),
        scene('arena'),
        letter('Hey, Nana.\n\nI still have the tickets from that year. I can tell you exactly where I was standing at every one.\n\nThe bigger the rooms got, the further away I was from you. Nobody did that on purpose.\n\nThat\'s what\'s so unfair about it.'),
        nar('Blast is everywhere now. Their songs leak out of convenience stores. Somebody has a tattoo of Nobu on their calf.'),
        say('nobu', 'shock', 'Somebody has a tattoo of ME! It looks like a thumb! My mother\'s inn got a call about it! This is the best day!'),
        keep('guitar'),
        nar('Word reaches a morning TV show about the mystery roommate who makes cakes. They invite her on, live, to bake one.'),
        say('hachi', 'shock', 'It\'s on fire! Why is it on fire! I\'m so sorry, Japan!'),
        say('nana', 'smirk', 'I\'ve got a lighter if it needs help.'),
        nar('Nana, who has come to watch, walks on set uninvited and eats the burnt half on camera. The ratings are the highest of the year.'),
        polaroid('morning-tv'),
        say('nana', 'neutral', 'Next week we share a bill with Trapnest.'),
        mini('crowdsurf'),
        scene('backstage'),
        nar('Backstage before the big one. Corridors, cables, and a tall man bounding toward them with both arms in the air.'),
        say('naoki', 'happy', 'Blast! Blast! Hi! I\'m Naoki, I play drums, I love your band, can I have this sandwich?'),
        say('yasu', 'neutral', 'Who let him in.'),
        say('naoki', 'happy', 'I live here! Hey, are you the scary one? Takumi says you\'re the scary one! Cool glasses!'),
        say('shin', 'neutral', 'Hachi-san. He\'s eaten all of Trapnest\'s. He\'s coming for ours. I think you should stop him.'),
        mini('sandwich'),
        say('naoki', 'sad', 'You\'re so strong. You\'re so mean. Can we be friends?'),
        nar('Then, down the corridor, somebody is singing softly, just to hear what it does.'),
        say('reira', 'neutral', 'Oh. I\'m sorry. Was I in the way? You must be Nana-san.'),
        say('nana', 'neutral', 'And you\'re the voice on all his records.'),
        say('reira', 'sad', 'Ren talks about you, you know. Not often. He goes very quiet first.'),
        say('takumi', 'neutral', 'Reira. Sound check. You shouldn\'t wander off.', 'left'),
        say('reira', 'sad', 'Everyone keeps me very safe. I sometimes wonder what I\'d sound like if they didn\'t.'),
        choice('Reira lingers in the corridor. She looks terribly alone for someone so loved.', [
          { label: 'Tell her you hear it. It sounds like singing inside a beautiful cage.', effects: { harmony: 1, bond: 1 }, flag: 'reira-respect', reply: [
            say('reira', 'happy', '...Nobody ever says that. Thank you. Please come and hear us again.')
          ] },
          { label: 'Ask for an autograph, on your arm, and then scream.', effects: { fame: 1, scandal: 1 }, reply: [
            say('reira', 'happy', 'There. Is that all right? Are you all right?'),
            say('hachi', 'shock', 'I\'m never washing this arm. Not ever. Please tell Junko I said goodbye.')
          ] },
          { label: 'Stand with Nana. Say nothing to the enemy.', effects: { bond: 1, fame: 1 }, reply: [
            say('nana', 'smirk', 'Good girl, Hachi.'),
            say('hachi', 'happy', 'I feel like I should be offended! But I\'m also so happy!')
          ] }
        ]),
        choice('Later, two men are waiting for Hachi at the stage door. Nobu is holding oden. Takumi is holding his car keys.', [
          { label: 'Go with Nobu. He has been kind for so long.', effects: { harmony: 2 }, flag: 'with-nobu', reply: [
            say('nobu', 'happy', 'R-really? Me? I\'m going to take you to my family\'s inn! You\'d love it! There\'s a bath with a view!', 'right'),
            nar('She is happy. She is so happy. She keeps telling herself that it\'s enough.')
          ] },
          { label: 'Get in Takumi\'s car. You already know you shouldn\'t.', effects: { fame: 1, bond: -1 }, flag: 'with-takumi', reply: [
            say('takumi', 'smirk', 'Good. I hate waiting. Put your seatbelt on.'),
            nar('Nobu stands at the door for a while, with the oden going cold in his hands.')
          ] },
          { label: 'Tell them both you\'re going home to Nana.', effects: { bond: 2 }, flag: 'chose-nana', reply: [
            say('nana', 'smirk', 'You turned down two guys for me? You\'re getting cocky, Hachi.'),
            say('hachi', 'happy', 'I brought cake!')
          ] }
        ]),
        scene('arena'),
        music('tension'),
        say('nana', 'angry', 'Hachi. Whatever happens out there. Watch me.'),
        say('reira', 'neutral', 'I\'ll sing as well as I can, Nana-san. I think it\'s what you\'d want.', 'left'),
        say('demon', 'smirk', 'Two voices, one stage! I brought contracts for everyone. Sign here, here, and across your future.'),
        mem('crush-them'),
        deal(),
        gig('birdcage', 'The Arena: Blast vs Trapnest', 'duel'),
        say('reira', 'happy', 'That was wonderful. I\'d like to do it again sometime.', 'left'),
        say('nana', 'smirk', 'Yeah. Me too. Tell Ren he\'s rushing the bridge.'),
        polaroid('rivals'),
        mem('jealous-reira'),
        polaroid('crowd-surf'),
        stat({ fame: 2 })
      ]
    },
    {
      id: 'rift', title: 'Rain on the Seventh Floor', manga: true, steps: [
        music('sad'),
        scene('rain-rift'),
        letter('Hey, Nana.\n\nI have been putting off this letter. I went out and bought stamps instead. I didn\'t need stamps. I bought eighty.\n\nThere\'s a part of our story I don\'t know how to write down. Anyone who read as far as it goes knows the part I mean. For anyone who didn\'t, I\'ll only say that it rained for a long time. And after that, there weren\'t so many of us at the table.\n\nI\'d like you to change it, please. I don\'t care if that\'s cheating.'),
        nar('Blast is on every screen in Japan. Hachi has news of her own. Her life has changed, and it can\'t be changed back.'),
        nar('She has been trying to tell Nana for nine days. The band has been in a different city for all nine of them.'),
        scene('jackson-hole'),
        say('junko', 'neutral', 'You have to tell her. Before someone else does. Hachi, look at me.'),
        say('hachi', 'sad', 'I know. I know. She\'s going to look at me and she won\'t say anything, Junko. That\'s the worst part.'),
        say('kyosuke', 'neutral', 'Whatever you decide, you know our door\'s open. Junko\'s already bought a spare futon.'),
        scene('room-707'),
        choice('Hachi is alone in the kitchen of 707, phone in hand. Tonight the tabloids go to press.', [
          { label: 'Call her. Now. Say it yourself, before anyone can print it.', effects: { bond: 3, harmony: 1 }, flag: 'told-first', reply: [
            nar('It rings for a very long time.'),
            say('hachi', 'sad', 'I wanted you to hear it from me. Whatever happens to us now, I wanted that.'),
            say('nana', 'sad', '...Okay.'),
            say('nana', 'neutral', 'Thanks for calling, Hachi.')
          ] },
          { label: 'She\'s on stage in an hour. Don\'t ruin her night. Wait.', effects: { fame: 1, bond: -2 }, flag: 'waited', reply: [
            nar('It\'s the kind thing to do. It\'s the wrong kind thing. The evening edition doesn\'t wait.')
          ] }
        ]),
        jump('heard-it-from-hachi', { flag: 'told-first' }),
        scene('newsstand'),
        nar('Nana learns it the way everyone learns everything now. From a rack outside a station, in forty-point type.'),
        scene('rain-rift'),
        say('nana', 'sad', 'I read about your life on a train platform. Next to a horse race.'),
        say('hachi', 'sad', 'Nana, I was going to...'),
        say('nana', 'angry', 'Everybody\'s always going to.'),
        jump('the-glass'),
        label('heard-it-from-hachi'),
        scene('rain-rift'),
        say('nana', 'sad', 'You called. I\'d got so used to finding out from the racks.'),
        say('nana', 'neutral', 'I\'m still angry. I don\'t know at what. Maybe just at time.'),
        label('the-glass'),
        jump('nobu-hurt', { flag: 'with-nobu' }),
        jump('after-nobu'),
        label('nobu-hurt'),
        scene('backstage'),
        say('nobu', 'sad', 'It\'s okay, Hachi-chan. It\'s okay. I\'d have raised the whole thing with you, you know. It\'s okay.', 'right'),
        nar('He is smiling. He keeps on smiling. It\'s the hardest thing she has ever had to look at.'),
        label('after-nobu'),
        scene('room-707'),
        nar('Room 707. Nana has come back for some of her things. One strawberry glass slips off the draining board. It doesn\'t quite break.'),
        say('nana', 'sad', 'There\'s a crack in it.'),
        say('hachi', 'sad', 'It still holds water.'),
        say('nana', 'sad', 'For now.'),
        mem('strawberry-glass'),
        say('nana', 'neutral', 'Everyone I\'ve ever loved told me they\'d stay, Hachi. My mother. Him. I keep the receipts in a song.'),
        say('nana', 'sad', 'So if you\'re going, go now. While I can still act like it\'s nothing to me.'),
        choice('She has her back to you. Her bag is by the door. The rain is very loud.', [
          { label: '"I\'m not going anywhere. You named me after a dog. Remember? I wait at the station."', effects: { bond: 3 }, flag: 'hachiko-vow', reply: [
            say('nana', 'sad', '...That dog waited for someone who was never coming back, you idiot.'),
            say('hachi', 'sad', 'I know. I looked it up. I\'m staying anyway.')
          ] },
          { label: 'Say nothing. Help her pack. Fold everything very carefully.', effects: { bond: 1, harmony: 1 }, reply: [
            nar('You fold a tartan shirt that smells of Seven Stars. You put a strawberry candy in the pocket and don\'t mention it.')
          ] },
          { label: '"Then go. You always leave first so nobody can leave you."', effects: { bond: -2, fame: 1 }, flag: 'said-it', reply: [
            say('nana', 'angry', 'Yeah.'),
            say('nana', 'sad', 'You\'re not wrong. I wish you were.')
          ] }
        ]),
        keep('tartan'),
        scene('rain-rift'),
        say('yasu', 'sad', 'The band\'s coming apart, Hachi. Nobu won\'t say so. Shin\'s stopped eating. I\'ve stopped counting her calls.'),
        say('yasu', 'neutral', 'The tour\'s booked. If it goes ahead without you two talking, it\'s just four people on a stage.'),
        say('shin', 'sad', 'Hachi-san? You used to make too much food. I liked that. That\'s all. Sorry.'),
        choice('The last night before the tour. Everyone wants something from you. There is only one of you.', [
          { label: 'Go home to 707. Leave the light on. Leave the door unlocked.', effects: { bond: 2, harmony: 2 }, flag: 'left-the-light-on', reply: [
            nar('You put the cracked glass in the middle of the table. You turn on the lamp in the window. You sit down to wait.'),
            say('hachi', 'sad', 'It\'s only a lamp. I know that. But a person could see it from the street.')
          ] },
          { label: 'Get the band in one room and make them eat dinner together.', effects: { harmony: 3 }, flag: 'band-dinner', reply: [
            nar('It\'s a terrible dinner. Nobody speaks. Shin eats two helpings. It\'s the best thing that has happened in weeks.'),
            say('nobu', 'sad', 'Thanks, Hachi-chan. I didn\'t know how to ask.')
          ] },
          { label: 'Tell the band to go. Be the band. Sell out everything.', effects: { fame: 3, bond: -1 }, flag: 'chose-stage', reply: [
            nar('The tour goes on. It is magnificent. The seat beside Nana on the bus stays empty, all the way to the end.')
          ] }
        ]),
        keep('door'),
        polaroid('cracked-glass'),
        mem('cheap-glass'),
        mem('every-day'),
        scene('hometown'),
        nar('And that is where it stops. The pages run out. Snow on a small street, a light in a window, nobody coming up the stairs.'),
        nar('This is exactly how the Demon Lord likes it.')
      ]
    },
    {
      id: 'finale', title: 'The Demon Lord\'s Encore', steps: [
        music('tension'),
        scene('demon-realm'),
        say('demon', 'happy', 'Welcome! Do sit. Not there. That chair is made of everyone\'s unanswered letters.'),
        say('hachi', 'shock', 'You\'re REAL! I knew it! It\'s all in the notebook! I wrote it all down, every single time!'),
        say('demon', 'happy', 'And beautifully kept! I had it framed. All those years of careful, loving complaint.'),
        say('demon', 'smirk', 'Do you know what I am, little dog? I am what moves in when a story stops. I live after the last page.'),
        say('demon', 'smirk', 'Nobody can finish you, so nobody can save you. You\'ll sit at that table forever.'),
        say('hachi', 'sad', 'All those people. All these years. They\'re still waiting to find out if we were okay.'),
        say('demon', 'happy', 'Yes! Isn\'t it marvellous? The rent is excellent.'),
        jump('alone', { notFlag: 'left-the-light-on' }),
        nar('Then, very far away, the sound of someone climbing the stairs. Boots. Seven floors of them.'),
        say('nana', 'smirk', 'Sorry I\'m late. Somebody left a light on.'),
        say('hachi', 'sad', 'NANAAA!! You\'re so late!! I have so much to tell you and I bought EIGHTY STAMPS!!'),
        say('nana', 'happy', 'Tell me after. Is this him? He\'s shorter than you said.'),
        say('demon', 'angry', 'I am a very average height for an UNSPEAKABLE EVIL!'),
        jump('band'),
        label('alone'),
        say('hachi', 'sad', 'It\'s just me. I should have left a light on. Why didn\'t I leave a light on...'),
        nar('Nobody is coming up the stairs. But you are still here, holding this. That counts for something.'),
        say('hachi', 'angry', 'Then you come with me. We\'ll do it ourselves. We\'ll be so loud.'),
        label('band'),
        jump('no-dinner', { notFlag: 'band-dinner' }),
        say('nobu', 'happy', 'Band\'s here! All of us! We ate dinner! It was awful! We\'re ready!'),
        stat({ harmony: 1 }),
        label('no-dinner'),
        say('yasu', 'smirk', 'Sticks are in the van. I\'ve read his contract. There\'s a loophole. It\'s called playing louder than him.'),
        say('shin', 'smirk', 'I\'m legally too young for this realm. Let\'s go.'),
        say('junko', 'neutral', 'Hachi. I\'ve told you for years that he isn\'t real. I\'m prepared to admit this is awkward.'),
        say('kyosuke', 'happy', 'I brought a spare futon, in case. I don\'t know why. It felt right.'),
        say('misato', 'happy', 'I have made a banner! It says "NANA-SAN" and on the back it says "NANA-SAN"!'),
        jump('no-reira', { notFlag: 'reira-respect' }),
        say('reira', 'happy', 'I heard somebody was in trouble. I\'d like to come and listen, if that\'s all right.', 'left'),
        say('naoki', 'happy', 'I also heard! I brought sandwiches! Who\'s the guy with the horns? I love his whole thing!', 'left'),
        label('no-reira'),
        say('demon', 'angry', 'Very well! One last show! My stage, my rules, and I will be taking requests from HELL.'),
        say('hachi', 'angry', 'You took my shoes, and my boyfriends, and my whole twenties! Give them back!'),
        say('demon', 'smirk', 'A personal favourite.'),
        say('nana', 'smirk', 'Hachi. Stay near the front. Don\'t blink.'),
        deal(),
        gig('demon-encore', 'After the Last Page', 'boss'),
        { type: 'ending' }
      ]
    }
  ];

  var endings = [
    {
      id: 'lights-on', title: 'The Lights in 707',
      when: { bond: 18, harmony: 8, maxScandal: 12, flag: 'left-the-light-on', bossDefeated: true },
      steps: [
        music('sad'),
        scene('demon-realm'),
        say('demon', 'shock', 'No. No no no. You can\'t simply KEEP GOING! There\'s no PAGE for this!'),
        say('hachi', 'happy', 'I know! We ran out of pages a long time ago! We\'re writing on the receipts!'),
        say('demon', 'sad', 'But who\'s going to tell you how it ends?'),
        say('nana', 'smirk', 'Nobody. That\'s how you lose.'),
        nar('He goes out like a stage light. There\'s a smell of burnt shochu. Somewhere, a notebook closes.'),
        scene('platform'),
        nar('A station, early, snow on the rails. A man is sitting on the bench with a padlock at his throat and his hands in his pockets.'),
        say('nana', 'neutral', 'You\'re late.'),
        say('ren', 'neutral', 'I took the long way.', 'left'),
        say('nana', 'sad', 'Idiot. Do you know how long I...'),
        say('ren', 'happy', 'I know. I\'m here.', 'left'),
        nar('Nobody says the rest of it. Nobody ever needed to.'),
        scene('room-707'),
        music('room'),
        nar('Room 707. It\'s morning, or something like it. Someone left the lamp on all night.'),
        nar('Two glasses on the table, strawberries all over them. One of them has a crack in it. It\'s holding water just fine.'),
        say('hachi', 'sad', 'You came back.'),
        say('nana', 'neutral', 'I said I would.'),
        say('hachi', 'angry', 'You did NOT! You have never said that even once in your whole life!'),
        say('nana', 'smirk', 'Then I\'m saying it now. Move over, your hair\'s on my side of the table. Is there cake?'),
        say('hachi', 'happy', 'There\'s always cake.'),
        mem('love-not-waste'),
        polaroid('lights-on'),
        letter('Hey, Nana.\n\nThis is the last one, I think. I\'ve used up the stamps.\n\nI want to be honest with whoever is reading over my shoulder. None of this happened. This isn\'t the ending. We don\'t know the ending. The one who knows it put down her pen a long time ago, and every one of us only ever hoped that she would be well first.\n\nShe doesn\'t owe us anything. Not one page.\n\nBut you kept the book. You kept it for all these years, with the spine cracked, open at the place where it stopped. You climbed seven flights of stairs for two girls made of ink.\n\nSo here\'s what I think. I don\'t think a story is over when it stops. I think it\'s over when nobody is waiting at the station.\n\nAnd look at you.\n\nThe lights are on in 707. They\'re going to stay on. Come by whenever you like. There\'s a glass for you.\n\nAlways, always yours,\nHachi')
      ]
    },
    {
      id: 'empty-chair', title: 'The Arena, and One Empty Chair',
      when: { flag: 'chose-stage', bossDefeated: true },
      steps: [
        music('sad'),
        scene('arena'),
        nar('The Demon Lord is beaten. The crowd is on its feet. The lights come up on the biggest room in Japan.'),
        say('nobu', 'happy', 'We did it! Listen to that! They\'re still singing!'),
        say('yasu', 'neutral', 'Yeah. We did.'),
        nar('There\'s a chair at the side of the stage with a strawberry glass on it. Nobody has sat there all tour.'),
        mem('face-to-face'),
        polaroid('empty-chair'),
        letter('Hey, Nana.\n\nI saw you on the big screen tonight. You looked like someone who had won.\n\nYou had, you know. Everyone says so.\n\nI\'m keeping up the rent on our apartment, even though neither of us lives there. The landlord thinks I\'m crazy. He might be right.\n\nIf you\'re ever passing. That\'s all. If you\'re ever passing.\n\nHachi')
      ]
    },
    {
      id: 'still-waiting', title: 'Still at the Station',
      when: { bossDefeated: true },
      steps: [
        music('sad'),
        scene('platform'),
        nar('The Demon Lord is beaten, for now. He has asked to be described as "on sabbatical".'),
        say('hachi', 'sad', 'I thought once he lost, everything would be fixed. It\'s mostly just quiet.'),
        say('yasu', 'neutral', 'You could call her.'),
        say('hachi', 'sad', 'I know. I have her number written on my hand. I keep having to write it again after baths.'),
        polaroid('station'),
        mem('wait-forever'),
        letter('Hey, Nana.\n\nIt\'s snowing here, and the trains have stopped. I thought you\'d like to know.\n\nWe beat him. We didn\'t fix it. It turns out those are two different things, and nobody tells you.\n\nI\'m going to wait a little longer. I\'ve been told I\'m good at it. You named me after a dog.\n\nHachi')
      ]
    },
    {
      id: 'demon-wins', title: 'Demon Lord: The Musical',
      steps: [
        music('title'),
        scene('demon-realm'),
        say('demon', 'happy', 'AND THAT\'S THE SHOW! Thank you! You\'ve been very cursed! Tip your fate on the way out!'),
        say('hachi', 'shock', 'NO! I want a rematch! I want to talk to your manager!'),
        say('takumi', 'smirk', 'He signed with me last week. It\'s a very good deal. For me.'),
        scene('newsstand'),
        nar('THE SUNDAY DEMON: "I WAS RIGHT ALL ALONG." A NEW MEMOIR. WITH A FOREWORD BY THE AUTHOR.'),
        scene('arena'),
        nar('Demon Lord: The Musical opens to a nine-year run. Hachi is cast as Girl Who Trips. Critics call her "committed".'),
        say('nana', 'angry', 'I\'m in the pit orchestra, Hachi. I play the triangle. I want you to know I blame you.'),
        say('hachi', 'sad', 'I know. I wrote it in the notebook.'),
        polaroid('musical'),
        letter('Hey, Nana.\n\nThe Demon Lord would like me to tell you that this letter has been read and approved by the Demon Lord.\n\nHe\'s lovely. Everything is lovely. Please send a very large stick.\n\nTry again, whoever you are. He gets careless around the second chorus.\n\nYour hostage,\nHachi')
      ]
    }
  ];

  var polaroids = {
    'seat-7-8': { title: 'Seat 7, Seat 8', caption: 'Snowed in with a stranger. A rice ball was involved.', art: { chars: ['hachi', 'nana'], scene: 'train-snow' } },
    'strawberry-glasses': { title: 'A Matching Set', caption: 'They are ridiculous. Nana carries hers herself.', art: { chars: ['nana', 'hachi'], scene: 'room-707' } },
    'first-gig': { title: 'Front Row, Eyes Stuck', caption: 'Nobu, Shin and Yasu, right before she stopped blinking.', art: { chars: ['nobu', 'shin', 'yasu'], scene: 'live-house' } },
    'red-flag': { title: 'He Held the Door', caption: 'Item forty-four in the case against the Demon Lord.', art: { chars: ['hachi'], scene: 'jackson-hole' } },
    'burger-summit': { title: 'The Burger Summit', caption: 'Junko has several follow-up questions. Kyosuke paid.', art: { chars: ['junko', 'kyosuke'], scene: 'jackson-hole' } },
    'padlock': { title: 'Mostly a Joke', caption: 'It was mostly a joke.', art: { chars: ['ren', 'nana'], scene: 'tokyo-night' } },
    'front-page': { title: 'Above the Fold', caption: 'Thirty copies. It didn\'t make it stop.', art: { chars: ['misato', 'hachi'], scene: 'newsstand' } },
    'rivals': { title: 'I\'d Like to Do It Again', caption: 'Two voices who never stopped listening to each other.', art: { chars: ['reira', 'nana'], scene: 'arena' } },
    'crowd-surf': { title: 'Somebody Has a Tattoo', caption: 'It looks like a thumb. Nobu has never been happier.', art: { chars: ['nobu', 'naoki'], scene: 'backstage' } },
    'van': { title: 'It Was Always a Left', caption: 'Five people, one van, and Shin\'s pension offer.', art: { chars: ['yasu', 'shin'], scene: 'road-van' } },
    'morning-tv': { title: 'Sorry, Japan', caption: 'She ate the burnt half on live television.', art: { chars: ['nana', 'hachi'], scene: 'arena' } },
    'cracked-glass': { title: 'Still Holds Water', caption: 'For now.', art: { chars: ['hachi', 'nana'], scene: 'rain-rift' } },
    'lights-on': { title: 'Lights On', caption: 'There\'s a glass for you.', art: { chars: ['hachi', 'nana'], scene: 'room-707' } },
    'empty-chair': { title: 'If You\'re Ever Passing', caption: 'She kept up the rent.', art: { chars: ['hachi'], scene: 'arena' } },
    'station': { title: 'Good at Waiting', caption: 'She was named after a dog.', art: { chars: ['hachi'], scene: 'platform' } },
    'musical': { title: 'Girl Who Trips', caption: 'Critics call her "committed".', art: { chars: ['demon', 'takumi'], scene: 'demon-realm' } }
  };

  var keepsakes = {
    ring: { title: 'The Armour Ring', icon: 'ring', caption: 'Vivienne Westwood silver, a whole finger of armour. Nana is almost never without it.' },
    cups: { title: 'The Strawberry Glasses', icon: 'cups', caption: 'One each, for Room 707. They were ridiculous and she carried hers herself.' },
    cake: { title: 'Strawberry Cake', icon: 'strawberry', caption: 'With coffee with milk. All it takes, some nights, to keep Nana in the room.' },
    shades: { title: 'Yasu\'s Sunglasses', icon: 'shades', caption: 'He only takes them off to clean them, and to tell you the truth.' },
    bass: { title: 'Shin\'s Bass', icon: 'bass', caption: 'Fifteen years old, walked in off the street, and got thrown nowhere near the stairs.' },
    shoes: { title: 'Rocking Horse Shoes', icon: 'shoes', caption: 'Hachi fell over in them twice. She\'d like that kept out of the record.' },
    lighter: { title: 'The Orb Lighter', icon: 'lighter', caption: 'Heavy, ridiculous, and always in Nana\'s hand. Ask any fan who owns one.' },
    padlock: { title: 'The Padlock', icon: 'padlock', caption: 'Sid Vicious wore one. Ren never found the moment to take his off.' },
    drumsticks: { title: 'Yasu\'s Sticks', icon: 'drumsticks', caption: 'Counts them in without being asked.' },
    guitar: { title: 'Nobu\'s Guitar', icon: 'guitar', caption: 'Heir to a family inn, and he chose this. His mother is getting used to it.' },
    tartan: { title: 'A Tartan Shirt', icon: 'tartan', caption: 'Smells of Seven Stars. There\'s a strawberry candy in the pocket.' },
    door: { title: 'The Key to 707', icon: 'door707', caption: 'Seventh floor. Nana and Hachi. Seven and eight.' }
  };

  NG.Story = { quiz: quiz, chapters: chapters, endings: endings, polaroids: polaroids, keepsakes: keepsakes };
})();
