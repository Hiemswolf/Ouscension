var handlers {
  bulletHandler: function(bullets) {
          for(i = 0; i < bullets.length; i++) {
            
            if(createdSelf && bullets[i].element !== null) {
              if($("#" + bullets[i].element).length == 0) {
                var element = document.createElement('div');
                element.className = 'bullet';
                element.id = bullets[i].element;
                element.style.transform = 'rotate(' + bullets[i].angle + 'deg)';
                document.getElementById('bulletContainer').appendChild(element);
              }
            }
            
            if(bullets[i].lifeTimer < 0) {
              var element = document.getElementById(bullets[i].element);
              if(element !== null) {
                element.style.display = "none";
                element.parentNode.removeChild(element);
              }
            } else {
              setPosition(bullets[i]);
            }
          }
        },
        
        portalHandler: function() {
          for(i = 0; i < portals.length; i++) {
            
            if(createdSelf && portals[i].element !== null) {
              if($("#" + portals[i].element).length == 0) {
                var element = document.createElement("div");
                element.className = "portal";
                element.id = portals[i].element;
                element.innerHTML = portals[i].teleport;
                element.style.left = '-50px';
                element.style.top = '-50px';
                document.getElementById('portalContainer').appendChild(element);
              }
            }
            
            setPosition(portals[i]);
          }
        }
};

module.exports = handlers;
