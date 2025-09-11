const axios = require('axios');

class NERService {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.timeout = 60000; // 60 seconds timeout for hybrid processing
  }

  async parseResumeFile(filePath) {
    try {
      console.log('Sending PDF file to NER service...');
      
      // Read PDF file and convert to base64
      const fs = require('fs');
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfBase64 = pdfBuffer.toString('base64');
      
      const response = await axios.post(`${this.baseURL}/parse-resume`, {
        pdf_base64: pdfBase64
      }, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log(`NER parsing successful. Found ${response.data.entityCount} entities.`);
        return {
          success: true,
          data: response.data.data
        };
      } else {
        console.error('NER service returned error:', response.data.error);
        return {
          success: false,
          error: response.data.error || 'NER parsing failed'
        };
      }
    } catch (error) {
      console.error('Error calling NER service:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: 'NER service is not running. Please start the service on port 5000.'
        };
      }
      
      if (error.code === 'ETIMEDOUT') {
        return {
          success: false,
          error: 'NER service timeout. The resume might be too large to process.'
        };
      }
      
      return {
        success: false,
        error: `NER service error: ${error.message}`
      };
    }
  }

  async parseResumeText(text) {
    try {
      console.log('Sending text to NER service...');
      
      const response = await axios.post(`${this.baseURL}/parse-resume`, {
        text: text
      }, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log(`NER parsing successful. Found ${response.data.entityCount} entities.`);
        return {
          success: true,
          data: response.data.data
        };
      } else {
        console.error('NER service returned error:', response.data.error);
        return {
          success: false,
          error: response.data.error || 'NER parsing failed'
        };
      }
    } catch (error) {
      console.error('Error calling NER service:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: 'NER service is not running. Please start the service on port 5000.'
        };
      }
      
      if (error.code === 'ETIMEDOUT') {
        return {
          success: false,
          error: 'NER service timeout. The resume might be too large to process.'
        };
      }
      
      return {
        success: false,
        error: `NER service error: ${error.message}`
      };
    }
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      });
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('NER service health check failed:', error.message);
      return false;
    }
  }

  // Extract industry tags from parsed data for AI job matching
  extractIndustryTags(parsedData) {
    // Return industry tags from NER service if available
    if (parsedData.industryTags && parsedData.industryTags.length > 0) {
      return parsedData.industryTags;
    }

    const industryKeywords = {
      'technology': ['software', 'developer', 'programmer', 'engineer', 'IT', 'tech', 'coding', 'javascript', 'python', 'react', 'node'],
      'healthcare': ['nurse', 'doctor', 'medical', 'hospital', 'clinic', 'healthcare', 'medicine'],
      'finance': ['accountant', 'finance', 'banking', 'financial', 'investment', 'accounting'],
      'education': ['teacher', 'professor', 'education', 'school', 'university', 'academic'],
      'marketing': ['marketing', 'advertising', 'social media', 'brand', 'campaign'],
      'sales': ['sales', 'business development', 'account manager', 'customer'],
      'bpo': ['call center', 'customer service', 'BPO', 'virtual assistant', 'support']
    };

    const tags = new Set();
    
    // Handle new structured data format
    const allTextParts = [];
    
    // Add skills
    if (parsedData.skills && Array.isArray(parsedData.skills)) {
      allTextParts.push(...parsedData.skills);
    }
    
    // Add experience positions and companies
    if (parsedData.experience && Array.isArray(parsedData.experience)) {
      parsedData.experience.forEach(exp => {
        if (exp.position) allTextParts.push(exp.position);
        if (exp.company) allTextParts.push(exp.company);
      });
    }
    
    // Add extracted text
    if (parsedData.extractedText) {
      allTextParts.push(parsedData.extractedText);
    }
    
    const allText = allTextParts.join(' ').toLowerCase();

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      for (const keyword of keywords) {
        if (allText.includes(keyword.toLowerCase())) {
          tags.add(industry);
          break;
        }
      }
    }

    return Array.from(tags);
  }

  // Determine experience level from parsed data
  determineExperienceLevel(parsedData) {
    // Return experience level from NER service if available
    if (parsedData.experienceLevel) {
      return parsedData.experienceLevel;
    }

    // Handle new structured data format
    const positions = [];
    const skills = parsedData.skills || [];
    const companies = [];
    
    if (parsedData.experience && Array.isArray(parsedData.experience)) {
      parsedData.experience.forEach(exp => {
        if (exp.position) positions.push(exp.position);
        if (exp.company) companies.push(exp.company);
      });
    }
    
    // Simple heuristic based on keywords
    const seniorKeywords = ['senior', 'lead', 'manager', 'director', 'head', 'principal'];
    const midKeywords = ['mid', 'intermediate', 'specialist', 'analyst'];
    
    const allText = [...positions, ...skills].join(' ').toLowerCase();
    
    if (seniorKeywords.some(keyword => allText.includes(keyword))) {
      return 'senior';
    }
    
    if (midKeywords.some(keyword => allText.includes(keyword))) {
      return 'mid';
    }
    
    // If has multiple companies or positions, likely mid-level
    if (companies.length > 2 || positions.length > 3) {
      return 'mid';
    }
    
    // If has skills but limited experience, likely junior
    if (skills.length > 3) {
      return 'junior';
    }
    
    return 'entry';
  }
}

module.exports = new NERService();
