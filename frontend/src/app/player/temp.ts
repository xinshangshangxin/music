import { Provider } from '../apollo/graphql';
import { getSongUrl } from '../audio/helper';

const list = {
  data: {
    parseUrl: [
      {
        id: '16AF258E5E0BAE3B95A19ED8B95CD8DF',
        provider: 'kugou',
        name: 'Keep Being You',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Isyana Sarasvati',
          },
        ],
        album: null,
        duration: 202057,
      },
      {
        id: 'B5BB7A3D96835B00E3E835B7B5BC5FF7',
        provider: 'kugou',
        name: '你把我灌醉',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'G.E.M.邓紫棋',
          },
        ],
        album: null,
        duration: 285023,
      },
      {
        id: '2272AECC1183E732820619DCFF335897',
        provider: 'kugou',
        name: '回忆的沙漏',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'G.E.M.邓紫棋',
          },
        ],
        album: null,
        duration: 233000,
      },
      {
        id: 'A4A5A55EFD947DF91B02D414C9529446',
        provider: 'kugou',
        name: 'All About You',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Hilary Duff',
          },
        ],
        album: null,
        duration: 162000,
      },
      {
        id: '84F4867ABBB0657CEA4CE8B9D97BA892',
        provider: 'kugou',
        name: 'Can You Hear',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '谭嘉仪',
          },
        ],
        album: null,
        duration: 244062,
      },
      {
        id: 'C1EE5D7281FCF51372FF5DE4AE6E9BB7',
        provider: 'kugou',
        name: '左边',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '杨丞琳',
          },
        ],
        album: null,
        duration: 274703,
      },
      {
        id: '04AB022193507DB69CF49324CF65B00F',
        provider: 'kugou',
        name: '可不可以 (女声版)',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '季彦霖',
          },
        ],
        album: null,
        duration: 234081,
      },
      {
        id: '90F48D8FB4D7F0F66732FCBBAD5B6864',
        provider: 'kugou',
        name: 'Superwoman',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Paulini',
          },
        ],
        album: null,
        duration: 319921,
      },
      {
        id: 'F53D7B8AFF943716A38334A5F96E5559',
        provider: 'kugou',
        name: 'Tu Me Manques',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Sheryfa Luna',
          },
        ],
        album: null,
        duration: 237217,
      },
      {
        id: 'C693DF2DDE6CFC3E765214BFEA56A0C0',
        provider: 'kugou',
        name: 'Stay Here Forever',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Jewel',
          },
        ],
        album: null,
        duration: 179879,
      },
      {
        id: 'E7EC2B2B1A5C4696CF5631C47FCB14F7',
        provider: 'kugou',
        name: 'Fade Away',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Sam Feldt',
          },
          {
            id: null,
            name: 'Lush &amp; Simon',
          },
          {
            id: null,
            name: 'Inna',
          },
        ],
        album: null,
        duration: 171000,
      },
      {
        id: '03C1434116F26D4DD78D265F52A97BB7',
        provider: 'kugou',
        name: 'Yesterday',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Leona Lewis',
          },
        ],
        album: null,
        duration: 234076,
      },
      {
        id: 'AE024B3C1891A3D790D840BB05E28F6F',
        provider: 'kugou',
        name: 'Bye Bye',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Mariah Carey',
          },
        ],
        album: null,
        duration: 266000,
      },
      {
        id: 'E18C99D768BA77F9F2D35E0E0FEF2E42',
        provider: 'kugou',
        name: '夜曲',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '周杰伦',
          },
        ],
        album: null,
        duration: 227761,
      },
      {
        id: '5F6EB8BDB46F39267E2E6DD1878FF590',
        provider: 'kugou',
        name: '选择失忆',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '季彦霖',
          },
        ],
        album: null,
        duration: 279038,
      },
      {
        id: '238B786A3F93C42E3D212953E1CE96C3',
        provider: 'kugou',
        name: '体面',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '于文文',
          },
        ],
        album: null,
        duration: 282080,
      },
      {
        id: '9EB234DEEF11B15ACC502655DCD64978',
        provider: 'kugou',
        name: 'Because Of You',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Kelly Clarkson',
          },
        ],
        album: null,
        duration: 221000,
      },
      {
        id: '89DBF61DDB5D51D81A460CA71E163DE4',
        provider: 'kugou',
        name: '侧脸',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '于果',
          },
        ],
        album: null,
        duration: 217089,
      },
      {
        id: '504D039E327F73E64C32A77E9FE5722C',
        provider: 'kugou',
        name: '圆',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'AGA',
          },
        ],
        album: null,
        duration: 248000,
      },
      {
        id: 'DCD9B08DCB94590FAF76EC5DC0B9DC6B',
        provider: 'kugou',
        name: 'Wonderful U (Demo)',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'AGA',
          },
        ],
        album: null,
        duration: 249000,
      },
      {
        id: 'BF6D4A36D25398736D0F99393C228136',
        provider: 'kugou',
        name: 'My Love',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Westlife',
          },
        ],
        album: null,
        duration: 233000,
      },
      {
        id: '9DABE29AE66707B42F587EA46E8F7ED4',
        provider: 'kugou',
        name: '眼泪的错觉',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '王露凝',
          },
          {
            id: null,
            name: '乔海清',
          },
        ],
        album: null,
        duration: 223007,
      },
      {
        id: 'F1AD930181B7800AC6BC6B1AF5C39D5A',
        provider: 'kugou',
        name: '第一次爱的人',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '王心凌',
          },
        ],
        album: null,
        duration: 233000,
      },
      {
        id: 'A2ADE99FA4240F1C978C77916B2A487F',
        provider: 'kugou',
        name: '둘이서 (两个人)',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '蔡妍',
          },
        ],
        album: null,
        duration: 186384,
      },
      {
        id: '053C2BEE4057B94614D03C5A31D276F3',
        provider: 'kugou',
        name: '最熟悉的陌生人',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '萧亚轩',
          },
        ],
        album: null,
        duration: 263941,
      },
      {
        id: '5D1F2F1B2BBAAA68BA2604D57BE18212',
        provider: 'kugou',
        name: '逆光',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '孙燕姿',
          },
        ],
        album: null,
        duration: 294060,
      },
      {
        id: '5AB7D37D59EF47FDFF7167EFB290D55E',
        provider: 'kugou',
        name: '我怀念的',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '孙燕姿',
          },
        ],
        album: null,
        duration: 287000,
      },
      {
        id: 'E04EAE8DBEEDFB83726C2F84826C5F4D',
        provider: 'kugou',
        name: '我会好好的',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '王心凌',
          },
        ],
        album: null,
        duration: 268669,
      },
      {
        id: '5EEB41DEA34BBF0134938CD9D343BEC9',
        provider: 'kugou',
        name: '爱丫爱丫',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'By2',
          },
        ],
        album: null,
        duration: 231993,
      },
      {
        id: 'B04C20F0B3B3820C0DFF67D869347D2A',
        provider: 'kugou',
        name: '于是',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'G.E.M.邓紫棋',
          },
        ],
        album: null,
        duration: 229000,
      },
      {
        id: 'A8136351BE3DA7D077E95B976EB723CB',
        provider: 'kugou',
        name: '来自天堂的魔鬼',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'G.E.M.邓紫棋',
          },
        ],
        album: null,
        duration: 245000,
      },
      {
        id: '34C7777FFFDD4FDF04E02AF1F6857CA4',
        provider: 'kugou',
        name: '光年之外',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'G.E.M.邓紫棋',
          },
        ],
        album: null,
        duration: 235000,
      },
      {
        id: 'C557337AD29B8222F1510DC011BE0BDC',
        provider: 'kugou',
        name: '你不是真正的快乐 (Live)',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'G.E.M.邓紫棋',
          },
        ],
        album: null,
        duration: 320104,
      },
      {
        id: '67FAC06F4B4564D2A8720A6AA25F08BD',
        provider: 'kugou',
        name: 'Good to be Bad',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'G.E.M.邓紫棋',
          },
        ],
        album: null,
        duration: 228388,
      },
      {
        id: '13226A74B0FEBFB3E77ABFA9D9B3E726',
        provider: 'kugou',
        name: '说爱我',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '梁一贞',
          },
        ],
        album: null,
        duration: 291550,
      },
      {
        id: 'E3B7DCAA56C2FE1B2E9D7582725B595F',
        provider: 'kugou',
        name: '依然爱你',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '王力宏',
          },
        ],
        album: null,
        duration: 246320,
      },
      {
        id: '9FBC1326D08133722E6F519F7E107C55',
        provider: 'kugou',
        name: '路太弯',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '潘玮柏',
          },
        ],
        album: null,
        duration: 220447,
      },
      {
        id: 'C8576780843100112F30F6E2145E6449',
        provider: 'kugou',
        name: '白月光',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '张信哲',
          },
        ],
        album: null,
        duration: 267520,
      },
      {
        id: '6DBCE7668CCA63787631B8A7D8833BD4',
        provider: 'kugou',
        name: '猜不透',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '丁当',
          },
        ],
        album: null,
        duration: 233482,
      },
      {
        id: '9A269294B702F9879513EB43FFC2FE64',
        provider: 'kugou',
        name: '不懂',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '贾添',
          },
        ],
        album: null,
        duration: 248000,
      },
      {
        id: '33C7F070215B38A3548EE54859D68323',
        provider: 'kugou',
        name: '泪了',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '曾沛慈',
          },
          {
            id: null,
            name: '东城卫',
          },
        ],
        album: null,
        duration: 273110,
      },
      {
        id: '80053DAB7D8AABE534673DCEB768195A',
        provider: 'kugou',
        name: '多想留在你身边',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '刘增瞳',
          },
        ],
        album: null,
        duration: 212000,
      },
      {
        id: '9C06E8BD5E129B233A54F384FB1A1710',
        provider: 'kugou',
        name: 'Soldier',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Samantha Jade',
          },
        ],
        album: null,
        duration: 202448,
      },
      {
        id: 'F75C6715BA646C0AAD6F569529A5C8C5',
        provider: 'kugou',
        name: 'Boys',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Charli XCX',
          },
        ],
        album: null,
        duration: 162000,
      },
      {
        id: '76B55F2C56154DF946EAC00A3001FB5B',
        provider: 'kugou',
        name: '说爱我',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '梁一贞',
          },
        ],
        album: null,
        duration: 285335,
      },
      {
        id: '15A7D13BD351D1115D8F46DDE22A3574',
        provider: 'kugou',
        name: '退',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '曲肖冰',
          },
        ],
        album: null,
        duration: 241095,
      },
      {
        id: '73F211B375593A4332BB5E4A28602C61',
        provider: 'kugou',
        name: '尽头',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '赵方婧',
          },
        ],
        album: null,
        duration: 256000,
      },
      {
        id: 'CC0C2FB0AE5BA6C7184D825F297B6552',
        provider: 'kugou',
        name: '大城小爱',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '王力宏',
          },
        ],
        album: null,
        duration: 222000,
      },
      {
        id: '1F0BCDABBA9E3B86769A8FCBADC8C76A',
        provider: 'kugou',
        name: 'Run Free (Radio Edit)',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Deep Chills',
          },
          {
            id: null,
            name: 'IVIE',
          },
        ],
        album: null,
        duration: 171000,
      },
      {
        id: '8C286D73B3C45B5F258048C73DF5E8BE',
        provider: 'kugou',
        name: 'Expression, When Nostalgia Came',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '陈淑婷KelsiChen',
          },
        ],
        album: null,
        duration: 253000,
      },
      {
        id: '39AE820A109E71B7AB1D59AF1D4D6652',
        provider: 'kugou',
        name: '一直想着他',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '庄心妍',
          },
        ],
        album: null,
        duration: 312894,
      },
      {
        id: 'C63D8509C5A537426199465821E57B43',
        provider: 'kugou',
        name: '如果没有你',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '莫文蔚',
          },
        ],
        album: null,
        duration: 290000,
      },
      {
        id: 'A24B2FF23DE7E36DB39628BFB009D9E3',
        provider: 'kugou',
        name: '没那么简单',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '黄小琥',
          },
        ],
        album: null,
        duration: 307514,
      },
      {
        id: '2901D578B074FD5BDD63D8C52A0D2226',
        provider: 'kugou',
        name: 'The Mass',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Era',
          },
        ],
        album: null,
        duration: 222458,
      },
      {
        id: '3D4C9E5E5B844384C8E565F870966A10',
        provider: 'kugou',
        name: '愿望',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '胡彦斌',
          },
        ],
        album: null,
        duration: 235000,
      },
      {
        id: 'E8EB9B358B8AB393C0265D9FD1F1EB5B',
        provider: 'kugou',
        name: 'What Are Words (你的话到底算什么)',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Chris Medina',
          },
        ],
        album: null,
        duration: 189054,
      },
      {
        id: '7CFF716AA06F764A4594B71D9510BA9C',
        provider: 'kugou',
        name: 'After the Afterparty',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Charli XCX',
          },
          {
            id: null,
            name: 'Lil Yachty',
          },
        ],
        album: null,
        duration: 219000,
      },
      {
        id: '86E8BF58A5A367AAD23E84BEF976BBA3',
        provider: 'kugou',
        name: '云烟成雨',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '房东的猫',
          },
        ],
        album: null,
        duration: 240000,
      },
      {
        id: '804C383E6E2B9B78786E4DE0A3280DD3',
        provider: 'kugou',
        name: '我们说好的',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '张靓颖',
          },
        ],
        album: null,
        duration: 270484,
      },
      {
        id: '8A1FA4D60EB51A37FE77921D65E341C7',
        provider: 'kugou',
        name: '请别说爱我',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '胡66',
          },
        ],
        album: null,
        duration: 225067,
      },
      {
        id: 'FB01B7EB8F06A27EDD76722506B5AC11',
        provider: 'kugou',
        name: '那时候的我',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '刘惜君',
          },
        ],
        album: null,
        duration: 232908,
      },
      {
        id: '0F1043F387826E1843D6B3473EC30B9C',
        provider: 'kugou',
        name: '如果爱下去',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '张靓颖',
          },
        ],
        album: null,
        duration: 242000,
      },
      {
        id: 'CF8DFC622D594FE15E65C0458041E413',
        provider: 'kugou',
        name: '你根本不懂',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '季彦霖',
          },
        ],
        album: null,
        duration: 208012,
      },
      {
        id: '1543CB6EEBB01A574FB2957481445C9D',
        provider: 'kugou',
        name: '说散就散',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '袁娅维',
          },
        ],
        album: null,
        duration: 242060,
      },
      {
        id: '6B648842AA400EAF47786E6A3B2937E0',
        provider: 'kugou',
        name: '飘雪',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '韩雪',
          },
        ],
        album: null,
        duration: 338345,
      },
      {
        id: '9A5AFBC923DC998EF875D457A900CEDD',
        provider: 'kugou',
        name: '房间',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '刘瑞琦',
          },
        ],
        album: null,
        duration: 265000,
      },
      {
        id: '49ED7AB604F3E49B2D4C1DA7879CAF3F',
        provider: 'kugou',
        name: 'Burning',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Maria Arredondo',
          },
        ],
        album: null,
        duration: 239542,
      },
      {
        id: '872BA4453C0AEE2B4C6123CE09960437',
        provider: 'kugou',
        name: '夏天',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '李玖哲',
          },
        ],
        album: null,
        duration: 226377,
      },
      {
        id: '11B3070F2C74D54B1976382158A9B622',
        provider: 'kugou',
        name: '遇到',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '方雅贤',
          },
        ],
        album: null,
        duration: 184189,
      },
      {
        id: 'DF0672687A4E9FB5C3A47722EAFCB57C',
        provider: 'kugou',
        name: '爸爸妈妈',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '王蓉',
          },
        ],
        album: null,
        duration: 265691,
      },
      {
        id: 'DFB041BADB4015CF7E6C149F7F948F9E',
        provider: 'kugou',
        name: '太多',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '陈冠蒲',
          },
        ],
        album: null,
        duration: 236000,
      },
      {
        id: '76CA858731C99F0B9E0A36BFBD2222D2',
        provider: 'kugou',
        name: '如果你也听说',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '张惠妹',
          },
        ],
        album: null,
        duration: 310000,
      },
      {
        id: '2018E9CABA91EC1E93AF1CC4C54668C6',
        provider: 'kugou',
        name: 'The Spectre',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Alan Walker',
          },
        ],
        album: null,
        duration: 194000,
      },
      {
        id: '7D84CE96DEF2CF2C3D8B71D700019F52',
        provider: 'kugou',
        name: '那年 (初版)',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '任然',
          },
        ],
        album: null,
        duration: 320000,
      },
      {
        id: '426650D5BB42A47131DB480A2A4081F3',
        provider: 'kugou',
        name: '后继者',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '任然',
          },
        ],
        album: null,
        duration: 242000,
      },
      {
        id: 'BB262D3552998E1E9202352A2FBDCD0E',
        provider: 'kugou',
        name: '外愈',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '任然',
          },
        ],
        album: null,
        duration: 214000,
      },
      {
        id: 'B67211632C692CB3A2B05E97D2FA1572',
        provider: 'kugou',
        name: '空空如也',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '任然',
          },
        ],
        album: null,
        duration: 213089,
      },
      {
        id: '37E1DDE1380D7D32AB56228C17B8596B',
        provider: 'kugou',
        name: 'Be What You Wanna Be',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Darin',
          },
        ],
        album: null,
        duration: 212000,
      },
      {
        id: '8EE9148F4056C49D9E02C7AD654B1443',
        provider: 'kugou',
        name: '以后的以后',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '庄心妍',
          },
        ],
        album: null,
        duration: 298000,
      },
      {
        id: '82C34F4B68BBB9CB48D55D0B5CF6978B',
        provider: 'kugou',
        name: 'My Happy Ending',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Avril Lavigne',
          },
        ],
        album: null,
        duration: 241815,
      },
      {
        id: 'CDC21E512F032A23AD982A2C15E7D0FA',
        provider: 'kugou',
        name: 'Complicated',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Avril Lavigne',
          },
        ],
        album: null,
        duration: 244000,
      },
      {
        id: '5974FE50D935479A35315054E1D90779',
        provider: 'kugou',
        name: 'When You&#039;re Gone',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Avril Lavigne',
          },
        ],
        album: null,
        duration: 240613,
      },
      {
        id: '30C5F1E9770564A63665FF5D35AABEE5',
        provider: 'kugou',
        name: 'Girlfriend (Radio Edit)',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Avril Lavigne',
          },
        ],
        album: null,
        duration: 215980,
      },
      {
        id: '81BB63B9DB8CCF6F9F4F039710BEFEB8',
        provider: 'kugou',
        name: '倔强',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '五月天',
          },
        ],
        album: null,
        duration: 260000,
      },
      {
        id: '89F1008ADB9505F505DB21AC8F14DCA5',
        provider: 'kugou',
        name: '雨爱',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '杨丞琳',
          },
        ],
        album: null,
        duration: 260000,
      },
      {
        id: '020E1C6C9ECB2D04A7CB7724015E3760',
        provider: 'kugou',
        name: 'Innocence',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Avril Lavigne',
          },
        ],
        album: null,
        duration: 233000,
      },
      {
        id: '15DAA5C51716A31B4F5027C27046230A',
        provider: 'kugou',
        name: '小半',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '陈粒',
          },
        ],
        album: null,
        duration: 297000,
      },
      {
        id: 'E2DA3FC02526C4AEC874E6790C4FD44F',
        provider: 'kugou',
        name: 'Worth It',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Fifth Harmony',
          },
          {
            id: null,
            name: 'Kid Ink',
          },
        ],
        album: null,
        duration: 224515,
      },
      {
        id: '5265AB766E8442C19BD766DBE21C3EC6',
        provider: 'kugou',
        name: '备爱',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '周思涵',
          },
        ],
        album: null,
        duration: 227000,
      },
      {
        id: '068BCD1A773F02BC387E45B7E8EF348B',
        provider: 'kugou',
        name: '放开',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '爱乐团王超',
          },
        ],
        album: null,
        duration: 251502,
      },
      {
        id: '91764E5960C9CD574616052F3F40E277',
        provider: 'kugou',
        name: '一个人失忆',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '薛凯琪',
          },
        ],
        album: null,
        duration: 296150,
      },
      {
        id: '7D7F2794D22B2BF686E537895F7B04AC',
        provider: 'kugou',
        name: '那个人',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '周延英(英子-effie)',
          },
        ],
        album: null,
        duration: 279000,
      },
      {
        id: 'C97B5336D2AED14C7428B430AD2078BC',
        provider: 'kugou',
        name: '初夏',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '刘瑞琦',
          },
        ],
        album: null,
        duration: 310000,
      },
      {
        id: '99374D520489698F05EC8E178E0735C0',
        provider: 'kugou',
        name: '六月的雨 (加快版DJ)',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '胡歌',
          },
        ],
        album: null,
        duration: 312372,
      },
      {
        id: 'C501DA29C5E4B39548E8D658ACDC5467',
        provider: 'kugou',
        name: '杀破狼 (Remix)',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'JS',
          },
        ],
        album: null,
        duration: 306886,
      },
      {
        id: 'F877C96333403C51CB114A68ECD25F79',
        provider: 'kugou',
        name: '发现爱',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '林俊杰',
          },
          {
            id: null,
            name: '金莎',
          },
        ],
        album: null,
        duration: 223000,
      },
      {
        id: 'DD6DFF19FA8F679F23E4AB781F12E1E4',
        provider: 'kugou',
        name: 'Far Away from Home',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Groove Coverage',
          },
        ],
        album: null,
        duration: 258351,
      },
      {
        id: '44DC17B7891E9BF64BB1FA7EE26447DC',
        provider: 'kugou',
        name: '记事本',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '陈慧琳',
          },
        ],
        album: null,
        duration: 246760,
      },
      {
        id: 'CA7A539A430A44E0124D5D2BAC04B82A',
        provider: 'kugou',
        name: '手放开',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '李圣杰',
          },
        ],
        album: null,
        duration: 265195,
      },
      {
        id: '271E8BC759FE8E58063D455CCE28C706',
        provider: 'kugou',
        name: '别想她',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '高进',
          },
        ],
        album: null,
        duration: 229198,
      },
      {
        id: 'EAB1576AF8A1CE8010E180410B64EB7F',
        provider: 'kugou',
        name: 'Boom Clap',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Charli XCX',
          },
        ],
        album: null,
        duration: 168803,
      },
      {
        id: '373D3532CA1E3F1BC0B57D63F6DD6D79',
        provider: 'kugou',
        name: 'I Could Be The One',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Donna Lewis',
          },
        ],
        album: null,
        duration: 226168,
      },
      {
        id: 'D9C3A65DBC19A9EE1BE3975F33E59B67',
        provider: 'kugou',
        name: '至少还有你',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '林忆莲',
          },
        ],
        album: null,
        duration: 274211,
      },
      {
        id: '8CB1F6E6637DA25257D091477F17B6A7',
        provider: 'kugou',
        name: '再见',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'G.E.M.邓紫棋',
          },
        ],
        album: null,
        duration: 206000,
      },
      {
        id: 'BE5AE18EF5A5E4445D3D16037F884127',
        provider: 'kugou',
        name: '你的承诺',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '海鸣威',
          },
        ],
        album: null,
        duration: 232647,
      },
      {
        id: '75062CEBEBF3EBEF3831D1A9EC3957BE',
        provider: 'kugou',
        name: '我们的爱',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'F.I.R.',
          },
        ],
        album: null,
        duration: 289000,
      },
      {
        id: '7D0D8E4EE9E5F18171CE6466D5F2267A',
        provider: 'kugou',
        name: '三角题',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: '二珂',
          },
        ],
        album: null,
        duration: 266000,
      },
      {
        id: '79196AE0BC28A057551AD1C4A4BDB416',
        provider: 'kugou',
        name: 'Dark Horse (Acoustic)',
        privilege: 'unknown',
        artists: [
          {
            id: null,
            name: 'Katy Perry',
          },
        ],
        album: null,
        duration: 167340,
      },
    ],
  },
};

export const tempSongList = list.data.parseUrl.map((item) => ({
  ...item,
  url: getSongUrl({ id: item.id, provider: item.provider as Provider }),
}));
