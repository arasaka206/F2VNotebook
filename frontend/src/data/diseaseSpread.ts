import type { DiseaseBulletin, DiseaseMapRegion } from '../types';

export const DISEASE_MAP_REGIONS: Record<'Vietnam' | 'Hanoi' | 'HCMC', DiseaseMapRegion> = {
  Vietnam: {
    id: 'Vietnam',
    center: [15.7, 107.7],
    zoom: 6,
    zones: [
      {
        id: 'northwest-h5n1',
        name: {
          en: 'Northwest poultry alert',
          vi: 'Cảnh báo gia cầm Tây Bắc',
        },
        center: [21.38, 103.08],
        radius_km: 90,
        severity: 'high',
        scope: 'outbreak',
        diseases: [
          { en: 'H5N1 avian influenza', vi: 'Cúm gia cầm H5N1' },
          { en: 'Poultry movement watch', vi: 'Giám sát vận chuyển gia cầm' },
        ],
        summary: {
          en: 'Public reports in May 2026 flagged H5N1 poultry outbreaks in Dien Bien and kept the northwest poultry corridor under elevated monitoring.',
          vi: 'Các bản tin công khai trong tháng 5/2026 ghi nhận ổ dịch cúm gia cầm H5N1 tại Điện Biên và duy trì mức giám sát cao trên hành lang vận chuyển gia cầm Tây Bắc.',
        },
        updated_at: '2026-05-27',
        source_label: 'UNMC / Lao Dong',
        source_url: 'https://www.unmc.edu/healthsecurity/transmission/2026/05/27/vietnam-destroys-thousands-of-poultry-following-h5n1-bird-flu-outbreaks/',
      },
      {
        id: 'red-river-watch',
        name: {
          en: 'Red River livestock watch',
          vi: 'Vành đai giám sát chăn nuôi Đồng bằng sông Hồng',
        },
        center: [21.05, 105.92],
        radius_km: 125,
        severity: 'high',
        scope: 'surveillance',
        diseases: [
          { en: 'African swine fever', vi: 'Dịch tả lợn châu Phi' },
          { en: 'Rabies', vi: 'Bệnh dại' },
        ],
        summary: {
          en: 'The national February 27, 2026 bulletin reported 225 ASF outbreaks in 23 provinces and cities, while Hanoi later reported dog-rabies clusters in Hoa Lac and Ha Bang.',
          vi: 'Bản tin toàn quốc ngày 27/02/2026 ghi nhận 225 ổ dịch tả lợn châu Phi tại 23 tỉnh, thành; sau đó Hà Nội tiếp tục ghi nhận các cụm bệnh dại ở Hòa Lạc và Hạ Bằng.',
        },
        updated_at: '2026-03-09',
        source_label: 'VOV / Vietnam.vn',
        source_url: 'https://english.vov.vn/en/society/authorities-order-mass-livestock-vaccination-after-38000-animal-deaths-post1271650.vov',
      },
      {
        id: 'north-central-dual-risk',
        name: {
          en: 'North-central dual-risk corridor',
          vi: 'Hành lang rủi ro kép Bắc Trung Bộ',
        },
        center: [18.38, 106.0],
        radius_km: 130,
        severity: 'critical',
        scope: 'outbreak',
        diseases: [
          { en: 'H5N1 avian influenza', vi: 'Cúm gia cầm H5N1' },
          { en: 'African swine fever', vi: 'Dịch tả lợn châu Phi' },
        ],
        summary: {
          en: 'Ha Tinh confirmed an H5N1 poultry outbreak in Cam Xuyen, while nearby Nghe An and Quang Tri recorded ASF events along a major livestock transport corridor.',
          vi: 'Hà Tĩnh xác nhận ổ dịch cúm gia cầm H5N1 tại Cẩm Xuyên, trong khi Nghệ An và Quảng Trị lân cận ghi nhận các điểm bùng phát dịch tả lợn châu Phi trên hành lang vận chuyển vật nuôi quan trọng.',
        },
        updated_at: '2026-04-06',
        source_label: 'Vietnam.vn / Tuoi Tre News',
        source_url: 'https://news.tuoitre.vn/police-intercept-truck-carrying-100-diseased-pigs-in-central-vietnam-103260407111731284.htm',
      },
      {
        id: 'central-highlands-watch',
        name: {
          en: 'Central Highlands watch belt',
          vi: 'Vành đai giám sát Tây Nguyên',
        },
        center: [13.98, 108.05],
        radius_km: 125,
        severity: 'watch',
        scope: 'surveillance',
        diseases: [
          { en: 'Lumpy skin disease', vi: 'Viêm da nổi cục' },
          { en: 'H5N1 avian influenza', vi: 'Cúm gia cầm H5N1' },
        ],
        summary: {
          en: 'The national MoAE bulletin kept lumpy skin disease and avian influenza on watch in the Central Highlands, with vaccine campaigns accelerating through early 2026.',
          vi: 'Bản tin toàn quốc của Bộ Nông nghiệp và Môi trường duy trì cảnh báo viêm da nổi cục và cúm gia cầm tại Tây Nguyên, đồng thời đẩy nhanh chiến dịch tiêm phòng trong đầu năm 2026.',
        },
        updated_at: '2026-03-08',
        source_label: 'VOV',
        source_url: 'https://english.vov.vn/en/society/authorities-order-mass-livestock-vaccination-after-38000-animal-deaths-post1271650.vov',
      },
      {
        id: 'southeast-asf-pressure',
        name: {
          en: 'Southeast pig-density pressure zone',
          vi: 'Vùng áp lực chăn nuôi heo Đông Nam Bộ',
        },
        center: [11.38, 107.38],
        radius_km: 135,
        severity: 'critical',
        scope: 'outbreak',
        diseases: [
          { en: 'African swine fever', vi: 'Dịch tả lợn châu Phi' },
          { en: 'Market surveillance', vi: 'Giám sát chợ đầu mối' },
        ],
        summary: {
          en: 'Lam Dong reported a large ASF event in May 2026, while Dong Nai intensified sanitation and vaccination because of high livestock density and interlinked southern supply chains.',
          vi: 'Lâm Đồng ghi nhận ổ dịch tả lợn châu Phi quy mô lớn trong tháng 5/2026, còn Đồng Nai tăng cường tiêu độc khử trùng và tiêm phòng do mật độ chăn nuôi cao và chuỗi cung ứng phía Nam liên kết chặt.',
        },
        updated_at: '2026-05-11',
        source_label: 'DTiNews / Vietnam.vn',
        source_url: 'https://dtinews.dantri.com.vn/vietnam-today/lam-dong-culls-more-than-9500-pigs-infected-with-african-swine-fever-20260511140205007.htm',
      },
      {
        id: 'mekong-delta-asf',
        name: {
          en: 'Mekong Delta pig-health alert',
          vi: 'Cảnh báo sức khỏe đàn heo Đồng bằng sông Cửu Long',
        },
        center: [10.1, 105.72],
        radius_km: 115,
        severity: 'high',
        scope: 'outbreak',
        diseases: [
          { en: 'African swine fever', vi: 'Dịch tả lợn châu Phi' },
          { en: 'Transport sanitation', vi: 'Khử trùng vận chuyển' },
        ],
        summary: {
          en: 'Can Tho and nearby Mekong Delta provinces recorded ASF activity in spring 2026, pushing veterinary teams to cull infected herds and reinforce transport controls.',
          vi: 'Cần Thơ và các tỉnh lân cận ở Đồng bằng sông Cửu Long ghi nhận hoạt động của dịch tả lợn châu Phi trong mùa xuân 2026, buộc lực lượng thú y phải tiêu hủy đàn nhiễm và siết chặt kiểm soát vận chuyển.',
        },
        updated_at: '2026-04-14',
        source_label: 'VOV',
        source_url: 'https://english.vov.vn/en/society/african-swine-fever-outbreaks-prompt-culling-of-over-100-pigs-in-can-tho-post1283801.vov',
      },
    ],
  },
  Hanoi: {
    id: 'Hanoi',
    center: [21.0285, 105.8542],
    zoom: 11,
    zones: [
      {
        id: 'hoa-lac-rabies',
        name: {
          en: 'Hoa Lac rabies focus',
          vi: 'Điểm nóng bệnh dại Hòa Lạc',
        },
        center: [21.03, 105.53],
        radius_km: 8,
        severity: 'critical',
        scope: 'outbreak',
        diseases: [
          { en: 'Rabies', vi: 'Bệnh dại' },
        ],
        summary: {
          en: 'Hanoi public health and veterinary teams monitored bite cases linked to a dog-rabies outbreak in Hoa Lac during early March 2026.',
          vi: 'Các đội y tế công cộng và thú y Hà Nội đã theo dõi các ca bị cắn liên quan đến ổ dịch bệnh dại trên chó ở Hòa Lạc trong đầu tháng 3/2026.',
        },
        updated_at: '2026-03-09',
        source_label: 'Vietnam.vn',
        source_url: 'https://www.vietnam.vn/en/theo-doi-suc-khoe-cac-truong-hop-bi-cho-dai-nghi-dai-can',
      },
      {
        id: 'ha-bang-rabies',
        name: {
          en: 'Ha Bang dog-rabies cluster',
          vi: 'Cụm bệnh dại trên chó Hạ Bằng',
        },
        center: [21.01, 105.67],
        radius_km: 7,
        severity: 'high',
        scope: 'outbreak',
        diseases: [
          { en: 'Rabies', vi: 'Bệnh dại' },
        ],
        summary: {
          en: 'Ha Bang remained part of the same Hanoi rabies response area, with local monitoring and vaccination follow-up continuing through March 2026.',
          vi: 'Hạ Bằng vẫn nằm trong vùng đáp ứng bệnh dại của Hà Nội, với hoạt động giám sát địa phương và theo dõi tiêm phòng tiếp tục trong tháng 3/2026.',
        },
        updated_at: '2026-03-09',
        source_label: 'Vietnam.vn',
        source_url: 'https://www.vietnam.vn/en/ha-noi-phat-hien-2-o-dich-cho-dai',
      },
      {
        id: 'inner-market-watch',
        name: {
          en: 'Inner-market movement watch',
          vi: 'Giám sát luồng vận chuyển nội đô',
        },
        center: [21.05, 105.86],
        radius_km: 10,
        severity: 'watch',
        scope: 'surveillance',
        diseases: [
          { en: 'African swine fever', vi: 'Dịch tả lợn châu Phi' },
          { en: 'Poultry inspection', vi: 'Kiểm tra gia cầm' },
        ],
        summary: {
          en: 'This zone reflects extra inspection pressure around urban distribution routes while national ASF and avian-influenza alerts remain active.',
          vi: 'Vùng này phản ánh áp lực kiểm tra bổ sung quanh các tuyến phân phối nội đô khi cảnh báo toàn quốc về dịch tả lợn châu Phi và cúm gia cầm vẫn còn hiệu lực.',
        },
        updated_at: '2026-02-27',
        source_label: 'VOV',
        source_url: 'https://english.vov.vn/en/society/authorities-order-mass-livestock-vaccination-after-38000-animal-deaths-post1271650.vov',
      },
      {
        id: 'southern-logistics-watch',
        name: {
          en: 'Southern logistics watch',
          vi: 'Giám sát cửa ngõ logistics phía Nam',
        },
        center: [20.95, 105.82],
        radius_km: 11,
        severity: 'watch',
        scope: 'surveillance',
        diseases: [
          { en: 'Transport-borne ASF risk', vi: 'Rủi ro ASF theo vận chuyển' },
          { en: 'Rabies follow-up', vi: 'Theo dõi bệnh dại' },
        ],
        summary: {
          en: 'The southern Hanoi gateway remains a monitoring zone for livestock transport, vaccination compliance and rapid tracing if new outbreaks appear.',
          vi: 'Cửa ngõ phía Nam Hà Nội tiếp tục là vùng giám sát vận chuyển vật nuôi, tuân thủ tiêm phòng và truy vết nhanh nếu xuất hiện ổ dịch mới.',
        },
        updated_at: '2026-03-31',
        source_label: 'Vietnam.vn',
        source_url: 'https://www.vietnam.vn/en/nghi-quyet-72-nq-tw-ha-noi-xay-la-chan-phong-dich-tu-som-tu-xa',
      },
    ],
  },
  HCMC: {
    id: 'HCMC',
    center: [10.8231, 106.6297],
    zoom: 11,
    zones: [
      {
        id: 'thu-duc-gateway',
        name: {
          en: 'Thu Duc gateway watch',
          vi: 'Giám sát cửa ngõ Thủ Đức',
        },
        center: [10.86, 106.78],
        radius_km: 8,
        severity: 'watch',
        scope: 'surveillance',
        diseases: [
          { en: 'African swine fever spillover watch', vi: 'Giám sát lan truyền ASF' },
          { en: 'Poultry product inspection', vi: 'Kiểm tra sản phẩm gia cầm' },
        ],
        summary: {
          en: 'This eastern gateway is a watch zone because southern livestock supply chains connect nearby outbreak provinces with the city’s distribution network.',
          vi: 'Cửa ngõ phía Đông này được đặt ở mức giám sát vì chuỗi cung ứng chăn nuôi phía Nam kết nối các tỉnh có ổ dịch lân cận với mạng lưới phân phối của thành phố.',
        },
        updated_at: '2026-05-11',
        source_label: 'DTiNews',
        source_url: 'https://dtinews.dantri.com.vn/vietnam-today/lam-dong-culls-more-than-9500-pigs-infected-with-african-swine-fever-20260511140205007.htm',
      },
      {
        id: 'hoc-mon-market-corridor',
        name: {
          en: 'Hoc Mon market corridor',
          vi: 'Hành lang chợ đầu mối Hóc Môn',
        },
        center: [10.89, 106.6],
        radius_km: 7,
        severity: 'high',
        scope: 'surveillance',
        diseases: [
          { en: 'Animal movement pressure', vi: 'Áp lực di chuyển vật nuôi' },
          { en: 'Slaughterhouse inspection', vi: 'Kiểm tra lò mổ' },
        ],
        summary: {
          en: 'Monitoring is elevated around major market and slaughter routes as authorities tighten inspections on animal-product movement into the city.',
          vi: 'Mức giám sát được nâng cao quanh các tuyến chợ đầu mối và giết mổ chính khi cơ quan chức năng siết kiểm tra dòng hàng động vật đi vào thành phố.',
        },
        updated_at: '2026-03-31',
        source_label: 'The Saigon Times',
        source_url: 'https://english.thesaigontimes.vn/pm-orders-urgent-crackdown-on-illegal-slaughtering/',
      },
      {
        id: 'binh-chanh-logistics',
        name: {
          en: 'Binh Chanh logistics belt',
          vi: 'Vành đai logistics Bình Chánh',
        },
        center: [10.72, 106.56],
        radius_km: 8,
        severity: 'watch',
        scope: 'surveillance',
        diseases: [
          { en: 'Biosecurity watch', vi: 'Giám sát an toàn sinh học' },
          { en: 'African swine fever', vi: 'Dịch tả lợn châu Phi' },
        ],
        summary: {
          en: 'The western freight gateway stays on watch because Mekong Delta ASF activity can move toward the city through transport and slaughter channels.',
          vi: 'Cửa ngõ vận tải phía Tây được duy trì cảnh giác vì hoạt động ASF ở Đồng bằng sông Cửu Long có thể dịch chuyển vào thành phố qua các kênh vận tải và giết mổ.',
        },
        updated_at: '2026-04-14',
        source_label: 'VOV',
        source_url: 'https://english.vov.vn/en/society/african-swine-fever-outbreaks-prompt-culling-of-over-100-pigs-in-can-tho-post1283801.vov',
      },
      {
        id: 'nha-be-southern-ring',
        name: {
          en: 'Nha Be southern distribution ring',
          vi: 'Vành đai phân phối phía Nam Nhà Bè',
        },
        center: [10.68, 106.73],
        radius_km: 7,
        severity: 'watch',
        scope: 'surveillance',
        diseases: [
          { en: 'Poultry sanitation watch', vi: 'Giám sát vệ sinh gia cầm' },
          { en: 'Urban zoonotic vigilance', vi: 'Cảnh giác bệnh lây động vật - người' },
        ],
        summary: {
          en: 'Southern distribution routes remain under hygiene watch as the city keeps tighter controls on animal products and nearby provinces continue disease response campaigns.',
          vi: 'Các tuyến phân phối phía Nam vẫn được giám sát vệ sinh chặt chẽ khi thành phố tăng kiểm soát sản phẩm động vật và các tỉnh lân cận tiếp tục chiến dịch ứng phó dịch bệnh.',
        },
        updated_at: '2026-04-15',
        source_label: 'aviNews / Saigon Times',
        source_url: 'https://avinews.com/en/authorities-target-pre-slaughter-violations-in-ho-chi-minh-city/',
      },
    ],
  },
};

export const FALLBACK_DISEASE_BULLETINS: DiseaseBulletin[] = [
  {
    title: 'Authorities order mass livestock vaccination after 38,000 animal deaths',
    url: 'https://english.vov.vn/en/society/authorities-order-mass-livestock-vaccination-after-38000-animal-deaths-post1271650.vov',
    source: 'VOV',
    published_at: '2026-02-27T12:34:00+07:00',
    summary: 'Nationwide public bulletin covering African swine fever, H5N1, lumpy skin disease and rabies surveillance in outbreak-hit areas.',
  },
  {
    title: 'Ha Tinh province destroys nearly 1,000 poultry infected with H5N1 avian influenza',
    url: 'https://www.vietnam.vn/en/ha-tinh-tieu-huy-gan-1-000-gia-cam-nhiem-cum-h5n1-siet-chat-ngan-lay-sang-nguoi',
    source: 'Vietnam.vn',
    published_at: '2026-02-10T09:32:00+07:00',
    summary: 'Public report of an H5N1 poultry outbreak in Cam Xuyen commune, Ha Tinh province.',
  },
  {
    title: 'Hanoi has discovered two outbreaks of rabies in dogs',
    url: 'https://www.vietnam.vn/en/ha-noi-phat-hien-2-o-dich-cho-dai',
    source: 'Vietnam.vn',
    published_at: '2026-03-05T00:00:00+07:00',
    summary: 'Public update on dog-rabies outbreaks in Hoa Lac and Ha Bang communes, Hanoi.',
  },
  {
    title: 'African swine fever outbreaks prompt culling of over 100 pigs in Can Tho',
    url: 'https://english.vov.vn/en/society/african-swine-fever-outbreaks-prompt-culling-of-over-100-pigs-in-can-tho-post1283801.vov',
    source: 'VOV',
    published_at: '2026-04-14T11:14:00+07:00',
    summary: 'Public outbreak bulletin for African swine fever in multiple households across Can Tho.',
  },
  {
    title: 'Lam Dong culls more than 9,500 pigs infected with African swine fever',
    url: 'https://dtinews.dantri.com.vn/vietnam-today/lam-dong-culls-more-than-9500-pigs-infected-with-african-swine-fever-20260511140205007.htm',
    source: 'DTiNews',
    published_at: '2026-05-11T14:13:00+07:00',
    summary: 'Large-scale African swine fever event in Lam Dong with intensified local monitoring and transport checks.',
  },
];
