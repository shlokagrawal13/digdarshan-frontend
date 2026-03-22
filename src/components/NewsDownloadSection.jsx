import { useState, useRef, useEffect } from "react"
import axios from "axios"
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function NewsDownloadSection() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [entriesPerPage, setEntriesPerPage] = useState("25")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedNews, setSelectedNews] = useState(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedItems, setSelectedItems] = useState([])
  const contentRef = useRef(null)
  const [newsData, setNewsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Function to get relative time
  const getRelativeTime = (dateStr) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  }

  // Category definitions with mapping between frontend and backend values
  const categories = [
    { value: "All", label: "सभी श्रेणियां", backendValue: null },
    { value: "national", label: "राष्ट्रीय", backendValue: "national" },
    { value: "international", label: "अंतरराष्ट्रीय", backendValue: "international" },
    { value: "business", label: "व्यापार", backendValue: "business" },
    { value: "sports", label: "खेल", backendValue: "sports" },
    { value: "entertainment", label: "मनोरंजन", backendValue: "entertainment" },
    { value: "technology", label: "टेक्नोलॉजी", backendValue: "technology" },
    { value: "madhyapradesh", label: "मध्यप्रदेश", backendValue: "madhyapradesh" },
    { value: "uttarpradesh", label: "उत्तरप्रदेश", backendValue: "uttarpradesh" },
    { value: "chhattisgarh", label: "छत्तीसगढ़", backendValue: "chhattisgarh" },
    { value: "state", label: "राज्य", backendValue: "state" },
    { value: "otherstates", label: "अन्य राज्य", backendValue: "otherstates" },
    { value: "lifestyle", label: "जीवन शैली", backendValue: "lifestyle" },
    { value: "health", label: "स्वास्थ्य", backendValue: "health" },
    { value: "education", label: "शिक्षा", backendValue: "education" },
    { value: "horoscope", label: "राशिफल", backendValue: "horoscope" }
  ]

  // Function to fetch news
  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (selectedCategory === "All") {
        // Fetch from all categories except "All"
        const newsPromises = categories
          .filter(cat => cat.value !== "All")
          .map(cat => 
            axios.get(`${process.env.REACT_APP_API_URL}/api/news/${cat.backendValue}`)
          )

        const responses = await Promise.all(newsPromises)
        const allNews = responses.flatMap(res => 
          res.data.posts ? res.data.posts : []
        )

        // Normalize the categories in the response
        const normalizedNews = allNews.map(post => ({
          ...post,
          category: post.category?.toLowerCase(),
          categories: post.categories?.map(cat => cat.toLowerCase())
        }))

        setNewsData(normalizedNews)
      } else {
        // Find the selected category's backend value
        const category = categories.find(cat => cat.value === selectedCategory)
        if (!category) {
          throw new Error(`Invalid category: ${selectedCategory}`)
        }

        // Fetch from selected category
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/news/${category.backendValue}`)
        if (response.data.posts) {
          const normalizedNews = response.data.posts.map(post => ({
            ...post,
            category: post.category?.toLowerCase(),
            categories: post.categories?.map(cat => cat.toLowerCase())
          }))
          setNewsData(normalizedNews)
        }
      }
    } catch (err) {
      console.error("Error fetching news:", err)
      setError("खबरें लाने में त्रुटि हुई है। कृपया पुनः प्रयास करें।")
    } finally {
      setLoading(false)
    }
  }

  // Fetch news data from API
  useEffect(() => {
    fetchNews()
  }, [selectedCategory])

  // Initial dummy data in case API fails
  const fallbackNewsData = [
    {
      id: 2915749,
      ctrgy: "KL",
      heading: "(बेंगलुरु ) रेल बॉक्स में रद्द हुआ कार्यक्रम...",
      date: "1 hour ago",
      num: 1,
      content:
        "बेंगलुरु में आयोजित होने वाला रेल बॉक्स कार्यक्रम अचानक रद्द कर दिया गया है। इस कार्यक्रम में कई प्रमुख हस्तियों के आने की उम्मीद थी। कार्यक्रम के आयोजकों ने बताया कि तकनीकी कारणों से यह निर्णय लिया गया है।",
      image: "/placeholder.svg?height=200&width=300",
      title: "रेल बॉक्स कार्यक्रम रद्द",
      fullDate: "2010-05-17 23:03:20",
    },
    {
      id: 2915675,
      ctrgy: "RS",
      heading: "(नई दिल्ली ) पीआईबी फैक्ट चेक पॉइंट ने ...",
      date: "1 hour ago",
      num: 2,
      content:
        "नई दिल्ली में पीआईबी फैक्ट चेक पॉइंट ने सोशल मीडिया पर वायरल हो रही कई खबरों को फेक न्यूज़ बताया है। इस संबंध में जारी बयान में कहा गया है कि नागरिकों को ऐसी अफवाहों से सावधान रहना चाहिए और केवल आधिकारिक स्रोतों से जानकारी प्राप्त करनी चाहिए।",
      image: "/placeholder.svg?height=200&width=300",
      title: "पीआईबी ने फेक न्यूज़ का किया खंडन",
      fullDate: "2010-05-17 23:05:10",
    },
    {
      id: 2915683,
      ctrgy: "PR",
      heading: "(कोरबा) प्रदेश के कैबिनेट मंत्री लखनलाल ...",
      date: "1 hour ago",
      num: 3,
      content:
        "कोरबा में प्रदेश के कैबिनेट मंत्री लखनलाल ने विकास कार्यों की समीक्षा की। उन्होंने अधिकारियों को निर्देश दिए कि सभी विकास कार्य समय पर पूरे किए जाएं। उन्होंने कहा कि विकास कार्यों में देरी बर्दाश्त नहीं की जाएगी।",
      image: "/placeholder.svg?height=200&width=300",
      title: "मंत्री ने की विकास कार्यों की समीक्षा",
      fullDate: "2010-05-17 23:10:15",
    },
    {
      id: 2915682,
      ctrgy: "PR",
      heading: "(कोरबा) प्रदेश के नेता प्रतिपक्ष डॉ. चरण...",
      date: "1 hour ago",
      num: 4,
      content:
        "कोरबा में प्रदेश के नेता प्रतिपक्ष डॉ. चरण ने सरकार पर गंभीर आरोप लगाए हैं। उन्होंने कहा कि सरकार विकास कार्यों में भेदभाव कर रही है और विपक्षी दलों के क्षेत्रों में विकास कार्य नहीं हो रहे हैं। उन्होंने इस मामले में जल्द ही एक विस्तृत रिपोर्ट जारी करने की बात कही है।",
      image: "/placeholder.svg?height=200&width=300",
      title: "नेता प्रतिपक्ष ने लगाए सरकार पर आरोप",
      fullDate: "2010-05-17 23:15:30",
    },
    {
      id: 2915670,
      ctrgy: "PR",
      heading: "(कोरबा) विरूपा यात्रा के साथ ही महारानीपेठ...",
      date: "1 hour ago",
      num: 5,
      content:
        "कोरबा में विरूपा यात्रा के साथ ही महारानीपेठ में एक विशेष कार्यक्रम का आयोजन किया गया। इस कार्यक्रम में स्थानीय कलाकारों ने अपनी प्रस्तुतियां दीं और लोगों ने बढ़-चढ़कर हिस्सा लिया। कार्यक्रम में स्थानीय संस्कृति और परंपराओं को बढ़ावा देने पर जोर दिया गया।",
      image: "/placeholder.svg?height=200&width=300",
      title: "विरूपा यात्रा में हुआ विशेष कार्यक्रम",
      fullDate: "2010-05-17 23:20:45",
    },
    // More news items with the same structure...
    {
      id: 2915669,
      ctrgy: "PR",
      heading: "(कोरबा) कटघोरा समाधान शिविर में प्राप्त...",
      date: "1 hour ago",
      num: 6,
      content:
        "कोरबा के कटघोरा में आयोजित समाधान शिविर में लोगों की समस्याओं का निपटारा किया गया। इस शिविर में स्थानीय प्रशासन के अधिकारी मौजूद थे और उन्होंने लोगों की समस्याओं को सुना और उनका समाधान करने का आश्वासन दिया।",
      image: "/placeholder.svg?height=200&width=300",
      title: "समाधान शिविर में हुआ समस्याओं का निपटारा",
      fullDate: "2010-05-17 23:10:10",
    },
    {
      id: 2915668,
      ctrgy: "PR",
      heading: "(कोरबा) ब्लॉक शिक्षा, साइबेरिन में प्रचार...",
      date: "1 hour ago",
      num: 7,
      content:
        "कोरबा के ब्लॉक शिक्षा विभाग ने साइबेरिन में शिक्षा के प्रचार के लिए एक विशेष अभियान शुरू किया है। इस अभियान के तहत स्कूली बच्चों को साइबर सुरक्षा के बारे में जागरूक किया जा रहा है और उन्हें इंटरनेट के सुरक्षित उपयोग के बारे में बताया जा रहा है।",
      image: "/placeholder.svg?height=200&width=300",
      title: "साइबर सुरक्षा अभियान शुरू",
      fullDate: "2010-05-17 23:30:20",
    },
    {
      id: 2915667,
      ctrgy: "PR",
      heading: "(कोरबा) कोरबा लोकसभा सांसद श्रीमती ज्योति...",
      date: "1 hour ago",
      num: 8,
      content:
        "कोरबा लोकसभा की सांसद श्रीमती ज्योति ने अपने क्षेत्र में विकास कार्यों की समीक्षा की। उन्होंने कहा कि उनका प्रयास है कि क्षेत्र का समग्र विकास हो और लोगों को बुनियादी सुविधाएं मिलें। उन्होंने कई नई परियोजनाओं की घोषणा भी की।",
      image: "/placeholder.svg?height=200&width=300",
      title: "सांसद ने की विकास कार्यों की समीक्षा",
      fullDate: "2010-05-17 23:35:40",
    },
    {
      id: 2915666,
      ctrgy: "RS",
      heading: "(नई दिल्ली ) भारतीय शेयर बाजार में विदे...",
      date: "2 hours ago",
      num: 9,
      content:
        "नई दिल्ली से प्राप्त जानकारी के अनुसार भारतीय शेयर बाजार में विदेशी निवेशकों का रुझान बढ़ रहा है। पिछले महीने विदेशी निवेशकों ने भारतीय बाजार में बड़ी मात्रा में निवेश किया है। विशेषज्ञों का मानना है कि यह रुझान आने वाले महीनों में भी जारी रह सकता है।",
      image: "/placeholder.svg?height=200&width=300",
      title: "शेयर बाजार में बढ़ा विदेशी निवेश",
      fullDate: "2010-05-17 22:03:20",
    },
    {
      id: 2915665,
      ctrgy: "RS",
      heading: "(मुंबई) कर्जन के दौरान जब भीग गई थी मैं...",
      date: "2 hours ago",
      num: 10,
      content:
        "मुंबई में एक फिल्म प्रमोशन इवेंट के दौरान एक प्रसिद्ध अभिनेत्री ने अपने अनुभव साझा किए। उन्होंने बताया कि एक फिल्म की शूटिंग के दौरान कर्जन में वह पूरी तरह से भीग गई थीं, लेकिन शूटिंग जारी रखी गई। उन्होंने कहा कि यह उनके करियर का एक यादगार अनुभव था।",
      image: "/placeholder.svg?height=200&width=300",
      title: "अभिनेत्री ने साझा किए यादगार अनुभव",
      fullDate: "2010-05-17 22:10:15",
    },
    // Add more news items with similar structure...
    {
      id: 2915650,
      ctrgy: "PR",
      heading: "(गोपाल)शिक्षा कार्यक्रमों अंतर्गत कुटीर एवं मु...",
      date: "2 hours ago",
      num: 10,
      content:
        "गोपाल क्षेत्र में शिक्षा कार्यक्रमों के अंतर्गत कुटीर उद्योगों को बढ़ावा देने के लिए एक विशेष अभियान शुरू किया गया है। इस अभियान के तहत स्थानीय लोगों को कुटीर उद्योगों से जुड़े प्रशिक्षण दिए जा रहे हैं और उन्हें स्वरोजगार के लिए प्रोत्साहित किया जा रहा है।",
      image: "/placeholder.svg?height=200&width=300",
      title: "कुटीर उद्योगों को बढ़ावा देने का अभियान",
      fullDate: "2010-05-17 21:03:20",
    },
  ]  // Filter news by category and loading state  // First filter by category
  const filteredByCategory = loading ? [] : (
    selectedCategory === "All" ? newsData : newsData.filter((item) => {
      const selectedCat = categories.find(cat => cat.value === selectedCategory);
      if (!selectedCat) return false;

      // Check both category and categories array
      const itemCategory = item.category?.toLowerCase();
      const itemCategories = item.categories?.map(cat => cat.toLowerCase()) || [];

      // Check if the item belongs to the selected category
      return (
        itemCategory === selectedCat.backendValue?.toLowerCase() ||
        itemCategory === selectedCat.label?.toLowerCase() ||
        itemCategories.includes(selectedCat.backendValue?.toLowerCase()) ||
        itemCategories.includes(selectedCat.label?.toLowerCase())
      );
    })
  )

  // Then filter by date if selected
  const filteredByDate = selectedDate
    ? filteredByCategory.filter((item) => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        return itemDate === selectedDate;
      })
    : filteredByCategory;
  // Finally paginate the results
  const pageStartIndex = (currentPage - 1) * Number(entriesPerPage);
  const pageEndIndex = pageStartIndex + Number(entriesPerPage);
  const filteredNews = filteredByDate.slice(pageStartIndex, pageEndIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Get current timestamp
  const getCurrentTime = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const seconds = now.getSeconds().toString().padStart(2, "0")
    return `${hours}:${minutes}:${seconds}`
  }

  // Calculate relative time
  const calculateRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'अभी अभी';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} मिनट पहले`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} घंटे पहले`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} दिन पहले`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} सप्ताह पहले`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} महीने पहले`;
    return `${Math.floor(diffInSeconds / 31536000)} साल पहले`;
  }

  // Handle news item click
  const handleNewsClick = (news) => {
    setSelectedNews(news)
    // Scroll to content section on mobile
    if (window.innerWidth < 768 && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Handle checkbox selection
  const handleCheckboxChange = (news) => {
    setSelectedItems(prevItems => {
      const isSelected = prevItems.some(item => item._id === news._id);
      if (isSelected) {
        return prevItems.filter(item => item._id !== news._id);
      } else {
        return [...prevItems, news];
      }
    });
  };

  // Handle select all checkbox
  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredNews);
    } else {
      setSelectedItems([]);
    }
  };

  // Download single news
  const downloadSingleNews = (news) => {
    const content = `
शीर्षक: ${news.title}
श्रेणी: ${news.categories?.length > 0 ? news.categories.join(", ") : news.category || "अवर्गीकृत"}
दिनांक: ${new Date(news.date).toLocaleDateString("hi-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
})}
विवरण: ${news.body}
    `

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `news_${news.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }  // Download multiple news
  const downloadMultipleNews = () => {
    if (selectedItems.length === 0) {
      alert("कृपया डाउनलोड करने के लिए कम से कम एक न्यूज़ चुनें")
      return
    }

    let content = ""
    selectedItems.forEach((news) => {
      content += `
==========================================================
शीर्षक: ${news.title}
श्रेणी: ${news.categories?.length > 0 ? news.categories.join(", ") : news.category || "अवर्गीकृत"}
दिनांक: ${new Date(news.date).toLocaleDateString("hi-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
})}
विवरण: ${news.body}
==========================================================\n\n`
    })

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `multiple_news_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  // Download news by category and date
  const downloadNewsByCategory = () => {
    if (!selectedCategory) {
      alert("कृपया एक श्रेणी चुनें")
      return
    }

    const newsToDownload = newsData.filter(item => {
      if (selectedCategory === "All") return true;
      
      const selectedCat = categories.find(cat => cat.value === selectedCategory);
      if (!selectedCat) return false;

      // Check both category and categories array using normalized values
      const itemCategory = item.category?.toLowerCase();
      const itemCategories = item.categories?.map(cat => cat.toLowerCase()) || [];

      return (
        itemCategory === selectedCat.backendValue?.toLowerCase() ||
        itemCategory === selectedCat.label?.toLowerCase() ||
        itemCategories.includes(selectedCat.backendValue?.toLowerCase()) ||
        itemCategories.includes(selectedCat.label?.toLowerCase())
      );
    });

    // Filter by date if selected
    const filteredByDate = selectedDate
      ? newsToDownload.filter((item) => {
          const newsDate = new Date(item.date).toISOString().split('T')[0];
          return newsDate === selectedDate;
        })
      : newsToDownload;

    if (filteredByDate.length === 0) {
      alert("चयनित श्रेणी और तारीख के लिए कोई न्यूज़ नहीं मिली")
      return
    }

    const categoryLabel = categories.find(cat => cat.value === selectedCategory)?.label || selectedCategory;
    let content = `श्रेणी: ${categoryLabel}\nदिनांक: ${selectedDate || "सभी तिथियां"}\n\n`;
    
    filteredByDate.forEach((news) => {
      content += `
==========================================================
शीर्षक: ${news.title}
श्रेणी: ${news.categories?.length > 0 ? news.categories.join(", ") : news.category || "अवर्गीकृत"}
दिनांक: ${new Date(news.date).toLocaleDateString("hi-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
})}
विवरण: ${news.body}
==========================================================\n\n`
    })

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCategory}_news_${selectedDate || Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Download single news with image as ZIP
  const downloadSingleNewsAsZip = async (news) => {
    try {
      const zip = new JSZip();

      // Add text content
      const content = `
शीर्षक: ${news.title}
श्रेणी: ${news.categories?.length > 0 ? news.categories.join(", ") : news.category || "अवर्गीकृत"}
दिनांक: ${new Date(news.date).toLocaleDateString("hi-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
})}
विवरण: ${news.body}
      `;
      zip.file(`${news.id}/content.txt`, content);

      // Add image if available
      if (news.image?.url) {
        try {
          const imgResponse = await fetch(news.image.url);
          const imgBlob = await imgResponse.blob();
          zip.file(`${news.id}/image.jpg`, imgBlob);
        } catch (error) {
          console.error('Error downloading image:', error);
        }
      }

      // Generate and save ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `news_${news.id}.zip`);
    } catch (error) {
      console.error('Error creating ZIP:', error);
      alert('फ़ाइल डाउनलोड करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    }
  };  // Download multiple news with images as ZIP
  const downloadMultipleNewsAsZip = async () => {
    if (selectedItems.length === 0) {
      alert("कृपया डाउनलोड करने के लिए कम से कम एक न्यूज़ चुनें");
      return;
    }

    try {
      const zip = new JSZip();
      
      // Create a folder for each news item
      for (const news of selectedItems) {
        const folderName = `news_${news._id || news.id}`;
        
        // Add text content
        const content = `
==========================================================
शीर्षक: ${news.title}
श्रेणी: ${news.categories?.length > 0 ? news.categories.join(", ") : news.category || "अवर्गीकृत"}
दिनांक: ${new Date(news.date).toLocaleDateString("hi-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
})}

विवरण:
${news.body}
==========================================================
        `;
        zip.file(`${folderName}/content.txt`, content);

        // Add image if available
        if (news.image?.url) {
          try {
            const imgResponse = await fetch(news.image.url);
            const imgBlob = await imgResponse.blob();
            zip.file(`${folderName}/image.jpg`, imgBlob);
          } catch (error) {
            console.error(`Error downloading image for news ${news._id || news.id}:`, error);
          }
        }
      }

      // Generate and save ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `selected_news_${Date.now()}.zip`);
    } catch (error) {
      console.error('Error creating ZIP:', error);
      alert('फ़ाइल डाउनलोड करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    }
  };

  // Download news by category with images as ZIP
  const downloadNewsByCategoryAsZip = async () => {
    if (!selectedCategory) {
      alert("कृपया एक श्रेणी चुनें");
      return;
    }

    const newsToDownload = newsData.filter(item => {
      if (selectedCategory === "All") return true;
      
      const selectedCat = categories.find(cat => cat.value === selectedCategory);
      if (!selectedCat) return false;

      const itemCategory = item.category?.toLowerCase();
      const itemCategories = item.categories?.map(cat => cat.toLowerCase()) || [];

      return (
        itemCategory === selectedCat.backendValue?.toLowerCase() ||
        itemCategory === selectedCat.label?.toLowerCase() ||
        itemCategories.includes(selectedCat.backendValue?.toLowerCase()) ||
        itemCategories.includes(selectedCat.label?.toLowerCase())
      );
    });

    // Filter by date if selected
    const filteredByDate = selectedDate
      ? newsToDownload.filter((item) => {
          const newsDate = new Date(item.date).toISOString().split('T')[0];
          return newsDate === selectedDate;
        })
      : newsToDownload;

    if (filteredByDate.length === 0) {
      alert("चयनित श्रेणी और तारीख के लिए कोई न्यूज़ नहीं मिली");
      return;
    }

    try {
      const zip = new JSZip();
      const categoryLabel = categories.find(cat => cat.value === selectedCategory)?.label || selectedCategory;

      for (const news of filteredByDate) {
        const folderName = `news_${news.id}`;
        
        // Add text content
        const content = `
शीर्षक: ${news.title}
श्रेणी: ${news.categories?.length > 0 ? news.categories.join(", ") : news.category || "अवर्गीकृत"}
दिनांक: ${new Date(news.date).toLocaleDateString("hi-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
})}
विवरण: ${news.body}
        `;
        zip.file(`${folderName}/content.txt`, content);

        // Add image if available
        if (news.image?.url) {
          try {
            const imgResponse = await fetch(news.image.url);
            const imgBlob = await imgResponse.blob();
            zip.file(`${folderName}/image.jpg`, imgBlob);
          } catch (error) {
            console.error(`Error downloading image for news ${news.id}:`, error);
          }
        }
      }

      // Generate and save ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${selectedCategory}_news_${selectedDate || Date.now()}.zip`);
    } catch (error) {
      console.error('Error creating ZIP:', error);
      alert('फ़ाइल डाउनलोड करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">News</h1>

      <div className="border-t border-gray-200 pt-4 mb-4"></div>

      <div className="mb-4">
        <label htmlFor="category" className="font-bold">
          Select Category :
        </label>
        <div className="flex items-center mt-2">
          <div className="relative w-64">
            <select
              id="category"
              className="block appearance-none w-full bg-white border border-gray-300 px-4 py-2 pr-8 rounded"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >              {categories.map((cat, index) => (
                <option key={`${cat.value}-${index}`} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={() => setSelectedCategory("All")}
        >
          Search News
        </button>

        <div className="flex items-center">
          <label htmlFor="date" className="mr-2">
            Date:
          </label>          <input
            type="date"
            id="date"
            className="border border-gray-300 rounded px-2 py-1"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setCurrentPage(1); // Reset to first page when date changes
            }}
          />
        </div>        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          onClick={downloadNewsByCategoryAsZip}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download by Category (ZIP)
        </button>

        <button
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          onClick={downloadMultipleNewsAsZip}
          disabled={selectedItems.length === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Selected ({selectedItems.length}) ZIP
        </button>
      </div>

      <div className="md:flex md:gap-4">
        {/* News list section */}
        <div className="md:w-1/2">
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">News/समाचार</h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={fetchNews}
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reload News
                </button>
                <span className="text-sm text-gray-500">({getCurrentTime()})</span>
              </div>
            </div>
          </div>          <div className="mb-4 flex flex-wrap items-center gap-2 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2">
              <label htmlFor="entriesPerPage" className="text-gray-600 whitespace-nowrap">Show</label>
              <select
                id="entriesPerPage"
                className="min-w-[70px] border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(e.target.value);
                  setCurrentPage(1); // Reset to first page when changing entries per page
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-gray-600 whitespace-nowrap">entries</span>
            </div>            <div className="ml-auto text-sm text-gray-500">
              Showing {Math.min((currentPage - 1) * Number(entriesPerPage) + 1, filteredByDate.length)} to {Math.min(currentPage * Number(entriesPerPage), filteredByDate.length)} of {filteredByDate.length} entries
            </div>
          </div>
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-b border-gray-200 px-4 py-3 text-left w-10">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAllChange}
                      checked={filteredNews.length > 0 && selectedItems.length === filteredNews.length}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">क्र.</th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">आईडी</th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">श्रेणी</th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">शीर्षक</th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">दिनांक</th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y cursor-pointer divide-gray-200">
                {filteredNews.map((item, index) => (
                  <tr 
                    key={item._id || index} 
                    className={`hover:bg-blue-50 transition-colors ${selectedNews?.id === item.id ? "bg-gray-50" : "bg-white"}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.some((selected) => selected._id === item._id)} 
                        onChange={() => handleCheckboxChange(item)} 
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900" onClick={() => handleNewsClick(item)}>
                      {(currentPage - 1) * Number(entriesPerPage) + filteredNews.indexOf(item) + 1}
                    </td>                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[100px] truncate" onClick={() => handleNewsClick(item)}>
                      {item._id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900" onClick={() => handleNewsClick(item)}>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100">
                        {item.categories?.length > 0 ? item.categories[0] : item.category || "अवर्गीकृत"}
                      </span>                    </td>                    <td className="px-4 py-3 text-sm w-[50%]" onClick={() => handleNewsClick(item)}>
                      <div className="text-blue-600 hover:text-blue-800 font-medium min-h-[4.5em] line-clamp-3">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 w-[25%]" onClick={() => handleNewsClick(item)}>
                      <div className="flex items-center space-x-1">
                       
                        <span>{calculateRelativeTime(item.date)}</span>
                      </div>
                    </td>                    <td className="px-4 py-3 text-sm">
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadSingleNewsAsZip(item)
                        }}
                        title="Download as ZIP with image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        ZIP
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 pt-0 mt-0"></div>        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-center w-full sm:w-auto gap-2">
              <button 
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                {Array.from({ length: Math.ceil(filteredByDate.length / Number(entriesPerPage)) }, (_, i) => i + 1)
                  .slice(0, 5)
                  .map((page) => (
                    <button
                      key={page}
                      className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium
                        ${currentPage === page 
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                {Math.ceil(filteredByDate.length / Number(entriesPerPage)) > 5 && (
                  <>
                    <span className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                    <button
                      className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      onClick={() => handlePageChange(Math.ceil(filteredByDate.length / Number(entriesPerPage)))}
                    >
                      {Math.ceil(filteredByCategory.length / Number(entriesPerPage))}
                    </button>
                  </>
                )}
              </nav>

              <button 
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => handlePageChange(Math.min(Math.ceil(filteredByCategory.length / Number(entriesPerPage)), currentPage + 1))}                disabled={currentPage === Math.ceil(filteredByDate.length / Number(entriesPerPage))}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="md:w-1/2 mt-8 md:mt-0" ref={contentRef}>
          <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px]">
            <h2 className="text-lg font-bold mb-4">Content (समाचार)</h2>

            {selectedNews ? (
              <div>                <h3 className="text-xl font-bold mb-2">{selectedNews.title}</h3>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span> श्रेणी: {selectedNews.categories?.length > 0 ? 
                    selectedNews.categories.join(", ") : 
                    selectedNews.category || "अवर्गीकृत"}
                  </span>
                  <span>{new Date(selectedNews.date).toLocaleDateString("hi-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</span>
                </div>

                <div className="mb-4">
                  <img
                    src={selectedNews.image?.url || "https://placehold.co/600x400?text=न्यूज़+इमेज"}
                    alt={selectedNews.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/600x400?text=न्यूज़+इमेज";
                    }}
                  />
                </div>

                <p className="text-gray-700 whitespace-pre-wrap">{selectedNews.body}</p>                <div className="mt-4">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    onClick={() => downloadSingleNewsAsZip(selectedNews)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download This News (with Image)
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>कृपया कोई न्यूज़ चुनें जिसका कंटेंट देखना चाहते हैं</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <div className="fixed bottom-4 right-4">
        <button className="bg-blue-900 text-white p-3 rounded">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div> */}
    </div>
  )
}