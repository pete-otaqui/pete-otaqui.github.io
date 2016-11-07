class JasmineHelper
  def self.files
    #return a list of files you want to load before your spec defintions load
    [
      
      "/src/lib/base2.js",
      "/src/lib/base2-dom.js",
      "/src/lib/json_parse.js",
      
      "/src/js/AjaxRequest.js",
      "/src/js/AjaxResponse.js"
    ]
  end

  def self.stylesheets
    #return a list of stylesheets you want to load in the runner    
    []
  end

end
