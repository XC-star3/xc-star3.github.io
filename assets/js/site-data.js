(() => {
  const PROJECT_TAG_LIBRARY = {
    EMBEDDED: 'Embedded Systems',
    MOTION_CONTROL: 'Motion Control',
    MOTOR_CONTROL: 'Motor Control',
    MECHANICAL_DESIGN: 'Mechanical Design',
    MECHANICAL_ASSEMBLY: 'Mechanical Assembly',
    OMNI_CHASSIS: 'Omnidirectional Chassis',
    GIMBAL: 'Gimbal Transmission',
    HARDWARE_DESIGN: 'Hardware Design',
    PCB_DESIGN: 'PCB Design',
    SYSTEM_INTEGRATION: 'System Integration',
    FIELD_DEBUGGING: 'Field Debugging',
    ROBOCON: 'ROBOCON',
    ROBOMASTER: 'RoboMaster',
    SIEMENS_CUP: 'Siemens Cup',
  };

  const PROJECTS = [
    {
      titleKey: 'projects.item1.title',
      descKey: 'projects.item1.desc',
      metaKey: 'projects.item1.meta',
      awardKey: 'projects.item1.award',
      image: 'assets/images/projects/robomaster-2025-1600.jpg',
      imageSmall: 'assets/images/projects/robomaster-2025-800.jpg',
      imageAltKey: 'projects.item1.imageAlt',
      imagePosition: 'center 55%',
      tags: [
        PROJECT_TAG_LIBRARY.MECHANICAL_DESIGN,
        PROJECT_TAG_LIBRARY.OMNI_CHASSIS,
        PROJECT_TAG_LIBRARY.GIMBAL,
        PROJECT_TAG_LIBRARY.ROBOMASTER,
      ],
      link: 'pages/projects/project1.html',
    },
    {
      titleKey: 'projects.item2.title',
      descKey: 'projects.item2.desc',
      metaKey: 'projects.item2.meta',
      awardKey: 'projects.item2.award',
      image: 'assets/images/projects/robocon-2026-1600.jpg',
      imageSmall: 'assets/images/projects/robocon-2026-800.jpg',
      imageAltKey: 'projects.item2.imageAlt',
      imagePosition: 'center 50%',
      tags: [
        PROJECT_TAG_LIBRARY.MOTION_CONTROL,
        PROJECT_TAG_LIBRARY.MOTOR_CONTROL,
        PROJECT_TAG_LIBRARY.EMBEDDED,
        PROJECT_TAG_LIBRARY.SYSTEM_INTEGRATION,
        PROJECT_TAG_LIBRARY.ROBOCON,
      ],
      link: 'pages/projects/project2.html',
    },
    {
      titleKey: 'projects.item3.title',
      descKey: 'projects.item3.desc',
      metaKey: 'projects.item3.meta',
      awardKey: 'projects.item3.award',
      placeholder: {
        icon: 'fas fa-microchip',
        labelKey: 'projects.item3.placeholderLabel',
        hintKey: 'projects.item3.placeholderHint',
      },
      tags: [
        PROJECT_TAG_LIBRARY.EMBEDDED,
        PROJECT_TAG_LIBRARY.HARDWARE_DESIGN,
        PROJECT_TAG_LIBRARY.PCB_DESIGN,
        PROJECT_TAG_LIBRARY.SIEMENS_CUP,
      ],
      link: 'pages/projects/project3.html',
    },
    {
      titleKey: 'projects.item4.title',
      descKey: 'projects.item4.desc',
      metaKey: 'projects.item4.meta',
      awardKey: 'projects.item4.award',
      image: 'assets/images/projects/robomaster-2026-1600.jpg',
      imageSmall: 'assets/images/projects/robomaster-2026-800.jpg',
      imageAltKey: 'projects.item4.imageAlt',
      imagePosition: 'center 50%',
      tags: [
        PROJECT_TAG_LIBRARY.MECHANICAL_ASSEMBLY,
        PROJECT_TAG_LIBRARY.SYSTEM_INTEGRATION,
        PROJECT_TAG_LIBRARY.FIELD_DEBUGGING,
        PROJECT_TAG_LIBRARY.ROBOMASTER,
      ],
      link: 'pages/projects/project4.html',
    },
  ];

  const OPEN_SOURCE_ITEMS = [
    { key: 'opensource.item1', linkCode: 'https://github.com/XC-star3/26Initial-RC-dog', linkDoc: null },
    {
      key: 'opensource.item2',
      linkCode: 'https://github.com/XC-star3/CyberBeast-driver-board-parameter-calibration',
      linkDoc: null,
    },
  ];

  const TIMELINE_EVENTS = [
    'timeline.event1',
    'timeline.event2',
    'timeline.event3',
    'timeline.event4',
    'timeline.event5',
    'timeline.event6',
  ];

  const AWARDS = ['awards.item1', 'awards.item2', 'awards.item3', 'awards.item4', 'awards.item5'];

  const TECH_STACK = [
    {
      category: 'skills.hardware',
      items: [
        { name: 'SolidWorks', icon: 'fas fa-cube' },
        { name: 'Creo', icon: 'fas fa-drafting-compass' },
        { name: 'Fusion 360', icon: 'fas fa-cubes' },
        { name: 'Structural Design', icon: 'fas fa-ruler-combined' },
        { name: 'Assembly', icon: 'fas fa-toolbox' },
      ],
    },
    {
      category: 'skills.embedded',
      items: [
        { name: 'STM32', icon: 'fas fa-microchip' },
        { name: 'Keil MDK', icon: 'fas fa-screwdriver-wrench' },
        { name: 'C / C++', icon: 'fas fa-code' },
        { name: 'CAN', icon: 'fas fa-network-wired' },
        { name: 'I2C / SPI', icon: 'fas fa-plug' },
        { name: 'LCEDA', icon: 'fas fa-pencil-ruler' },
        { name: 'PCB Design', icon: 'fas fa-layer-group' },
      ],
    },
    {
      category: 'skills.robotics',
      items: [
        { name: 'Motor Tuning', icon: 'fas fa-sliders' },
        { name: 'PID', icon: 'fas fa-wave-square' },
        { name: 'State Machine', icon: 'fas fa-diagram-project' },
        { name: 'System Integration', icon: 'fas fa-link' },
        { name: 'Webots', icon: 'fas fa-globe' },
        { name: 'MuJoCo', icon: 'fas fa-cube' },
        { name: 'Isaac Sim', icon: 'fas fa-vr-cardboard' },
        { name: 'mjlab', icon: 'fas fa-flask' },
      ],
    },
    {
      category: 'skills.software',
      items: [
        { name: 'Linux', icon: 'fab fa-linux' },
        { name: 'Git', icon: 'fab fa-git-alt' },
        { name: 'VS Code', icon: 'fas fa-code' },
        { name: 'Python', icon: 'fab fa-python' },
      ],
    },
  ];

  const CONTACT_LINKS = [
    { icon: 'fab fa-github', key: 'contact.github', link: 'https://github.com/XC-star3' },
    { icon: 'fas fa-envelope', key: 'contact.email', link: 'mailto:209358371@qq.com' },
  ];


  window.SiteData = { PROJECTS, OPEN_SOURCE_ITEMS, TIMELINE_EVENTS, AWARDS, TECH_STACK, CONTACT_LINKS };
})();
