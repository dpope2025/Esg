import { FullCourseData } from './types';

export const COURSE_DATA: FullCourseData = {
  "landing_page": {
    "title": "ESG Fundamentals",
    "short_description": "Master the core principles of Environmental, Social, and Governance (ESG) criteria. Learn how modern organizations are driving sustainability, ethical impact, and robust oversight in a changing global economy.",
    "key_features": [
      "Interactive AI-Scripted Video Lessons",
      "Real-world Scenario Quizzes",
      "Official Certificate of Completion",
      "AI Tutor Support"
    ]
  },
  "course": {
    "modules": [
      {
        "module_title": "Module 1: Core ESG Pillars",
        "lessons": [
          {
            "id": "l1",
            "title": "1. What is ESG? Introduction to the Concept",
            "video_script": "Welcome to ESG Fundamentals. Imagine a company not just as a profit machine, but as a citizen of the world. That is the heart of ESG. E stands for Environmental: how a company stewards nature. S is Social: how it manages relationships with employees, suppliers, customers, and communities. G is Governance: a company's leadership, executive pay, audits, internal controls, and shareholder rights. In the past, value was just money. Today, value includes sustainability and ethics. In this course, we will unpack each letter and understand why investors and consumers demand ESG compliance.",
            "visual_guidance": "A split screen showing a traditional factory turning into a green, solar-powered facility. Text overlays: 'Environment', 'Social', 'Governance' appearing as pillars supporting a globe.",
            "summary": "ESG represents a shift from shareholder primacy to stakeholder capitalism. It evaluates companies based on their environmental stewardship, social responsibility, and governance structures.",
            "key_takeaways": [
              "ESG stands for Environmental, Social, and Governance.",
              "It is a framework for assessing non-financial performance.",
              "It moves focus from short-term profit to long-term sustainability."
            ],
            "quiz": [
              {
                "question": "What does the acronym ESG stand for?",
                "options": [
                  {"answer": "Economic, Social, Government", "correct": false},
                  {"answer": "Environmental, Social, Governance", "correct": true},
                  {"answer": "Energy, Sales, Growth", "correct": false}
                ]
              },
              {
                "question": "Which stakeholder group is primarily driving the demand for ESG?",
                "options": [
                  {"answer": "Only environmental activists", "correct": false},
                  {"answer": "Investors, consumers, and regulators", "correct": true},
                  {"answer": "Competitors", "correct": false}
                ]
              },
              {
                "question": "The 'G' in ESG typically refers to:",
                "options": [
                  {"answer": "Government lobbying", "correct": false},
                  {"answer": "Internal company leadership and controls", "correct": true},
                  {"answer": "Global shipping routes", "correct": false}
                ]
              }
            ]
          },
          {
            "id": "l2",
            "title": "2. Environmental Pillar: Key Principles & Examples",
            "video_script": "Let's dive into the 'E'. The Environmental pillar measures a company's impact on the living world. This isn't just about recycling paper. It's about Carbon Footprint: typically measured in Scope 1, 2, and 3 emissions. It's about Resource Depletion: water usage and waste management. Consider a clothing brand. Are they using organic cotton? How much water does it take to dye their jeans? Are they polluting local rivers? Companies scoring high on 'E' are actively reducing emissions, investing in renewable energy, and innovating to create circular economies where waste becomes a new resource.",
            "visual_guidance": "Animated infographic showing Scope 1 (Direct), Scope 2 (Power), and Scope 3 (Supply Chain) emissions. Footage of wind turbines and clean water initiatives.",
            "summary": "The Environmental pillar focuses on corporate impact on the planet, including climate change, resource usage, waste management, and pollution.",
            "key_takeaways": [
              "Carbon footprints are categorized into Scope 1, 2, and 3.",
              "Resource management (water, raw materials) is critical.",
              "The goal is often a 'Circular Economy' or 'Net Zero'."
            ],
            "quiz": [
              {
                "question": "Scope 3 emissions typically refer to:",
                "options": [
                  {"answer": "Emissions from company cars", "correct": false},
                  {"answer": "Emissions from the company's supply chain and product use", "correct": true},
                  {"answer": "Emissions from the office air conditioning", "correct": false}
                ]
              },
              {
                "question": "Which of the following falls under the 'E' pillar?",
                "options": [
                  {"answer": "Board diversity", "correct": false},
                  {"answer": "Water usage efficiency", "correct": true},
                  {"answer": "Employee minimum wage", "correct": false}
                ]
              },
              {
                "question": "What is a circular economy?",
                "options": [
                  {"answer": "A system where money circulates quickly", "correct": false},
                  {"answer": "An economic model aimed at eliminating waste and continual use of resources", "correct": true},
                  {"answer": "Trading only with neighboring countries", "correct": false}
                ]
              }
            ]
          },
          {
            "id": "l3",
            "title": "3. Social Pillar: How Organizations Impact People",
            "video_script": "The 'S' is for Social. Companies are made of people and serve people. This pillar examines relationships. Internally, do you have fair labor practices? Is there diversity and inclusion? Are wages fair? Externally, how does the company treat the community? For example, a mining company might be profitable, but if it displaces a local village or ignores safety protocols leading to injury, it fails the Social pillar. Modern investors know that poor social practices lead to strikes, lawsuits, and brand damage. Strong 'S' scores mean high employee engagement and strong community trust.",
            "visual_guidance": "Montage of diverse office environments, safety training sessions, and community outreach programs. A scale weighing 'Profit' vs 'People' balancing out.",
            "summary": "The Social pillar assesses relationships with employees, suppliers, customers, and communities, focusing on human rights, labor standards, and diversity.",
            "key_takeaways": [
              "Internal 'S': Diversity, wages, safety, labor rights.",
              "External 'S': Community relations, supply chain ethics.",
              "Poor social performance creates reputational and operational risk."
            ],
            "quiz": [
              {
                "question": "Which issue belongs to the Social pillar?",
                "options": [
                  {"answer": "Data privacy and customer protection", "correct": true},
                  {"answer": "Greenhouse gas emissions", "correct": false},
                  {"answer": "Shareholder voting rights", "correct": false}
                ]
              },
              {
                "question": "Why is supply chain management a social issue?",
                "options": [
                  {"answer": "It isn't; it is purely logistical", "correct": false},
                  {"answer": "Because it involves ensuring suppliers do not use child or forced labor", "correct": true},
                  {"answer": "Because trucks use gas", "correct": false}
                ]
              },
              {
                "question": "High employee turnover is often a sign of:",
                "options": [
                  {"answer": "Weak Social performance", "correct": true},
                  {"answer": "Strong Environmental performance", "correct": false},
                  {"answer": "Good Governance", "correct": false}
                ]
              }
            ]
          },
          {
            "id": "l4",
            "title": "4. Governance Pillar: Ethics, Structure, Oversight",
            "video_script": "Governance is often the 'quiet' pillar, but it is the brain of the operation. It covers how a company is run. Does the Board of Directors have diverse perspectives, or is it just the CEO's friends? Are executive bonuses tied to sustainable goals or just stock price? Is there transparency in tax reporting? Governance includes anti-corruption measures and whistleblower protections. A company with strong Environmental and Social goals but corrupt Governance will eventually fail because there is no accountability. Governance ensures that the promises made in E and S are actually kept.",
            "visual_guidance": "Boardroom meeting animation. Documents being stamped 'Approved'. Icons representing 'Transparency', 'Accountability', and 'Ethics'.",
            "summary": "Governance deals with a company’s leadership, executive pay, audits, internal controls, and shareholder rights. It ensures accountability and transparency.",
            "key_takeaways": [
              "Board independence and diversity are crucial.",
              "Executive compensation should align with long-term goals.",
              "Transparency prevents corruption and fraud."
            ],
            "quiz": [
              {
                "question": "Good Governance typically requires:",
                "options": [
                  {"answer": "The CEO to also be the Chairman of the Board", "correct": false},
                  {"answer": "Independent board members who can oversee the CEO", "correct": true},
                  {"answer": "Hiding tax strategies from the public", "correct": false}
                ]
              },
              {
                "question": "Executive compensation in an ESG framework should:",
                "options": [
                  {"answer": "Be as high as possible", "correct": false},
                  {"answer": "Be tied only to short-term stock price", "correct": false},
                  {"answer": "Align with long-term sustainability and performance goals", "correct": true}
                ]
              },
              {
                "question": "Whistleblower protection is a key aspect of:",
                "options": [
                  {"answer": "Marketing", "correct": false},
                  {"answer": "Governance", "correct": true},
                  {"answer": "Social Media", "correct": false}
                ]
              }
            ]
          },
          {
            "id": "l5",
            "title": "5. Why ESG Matters: Global Trends & Future Outlook",
            "video_script": "Why does this all matter? Because the world is changing. Investment funds managing trillions of dollars now screen for ESG. If you don't meet the criteria, you don't get the capital. Governments are passing laws like the EU's SFDR requiring disclosure. Consumers, especially Gen Z and Millennials, vote with their wallets, preferring ethical brands. The future of business is not just about being the best *in* the world, but being the best *for* the world. Ignoring ESG is no longer a moral failing; it is a financial risk. Embracing it is the biggest opportunity of our time.",
            "visual_guidance": "Graphs showing rise in ESG fund assets. World map lighting up with regulations. Montage of future cities and clean tech.",
            "summary": "ESG is becoming mandatory through investor demand and government regulation. It is a critical driver of access to capital and long-term resilience.",
            "key_takeaways": [
              "ESG is driven by capital allocation (investors).",
              "Regulatory pressure is increasing globally.",
              "ESG creates resilience against future risks."
            ],
            "quiz": [
              {
                "question": "What is a primary financial driver for ESG adoption?",
                "options": [
                  {"answer": "It is cheaper to pollute", "correct": false},
                  {"answer": "Access to capital from institutional investors", "correct": true},
                  {"answer": "To look good on Instagram", "correct": false}
                ]
              },
              {
                "question": "How do consumers influence ESG?",
                "options": [
                  {"answer": "By 'voting with their wallets' for ethical brands", "correct": true},
                  {"answer": "They have no influence", "correct": false},
                  {"answer": "By ignoring product labels", "correct": false}
                ]
              },
              {
                "question": "The phrase 'Best for the world' implies:",
                "options": [
                  {"answer": "Charity only", "correct": false},
                  {"answer": "Creating shared value for all stakeholders", "correct": true},
                  {"answer": "Having the highest stock price", "correct": false}
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "certificate": {
    "certificate_title": "Certificate of Completion",
    "certificate_text": "This certifies that {{NAME}} has successfully completed the ESG Fundamentals course.",
    "shareable_message": "I just earned my ESG Fundamentals Certificate! 🌍 #ESG #Sustainability #Learning"
  }
};