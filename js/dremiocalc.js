(function() {
  var log;

  log = function() {
    return false;
  };

  window.dremioCalc = function(vals) {
    return $("[dremio-calc='app']").each(function() {
      var $app, $input, animateVal, doCalc, input, inputs, outputs, updateFromParams, updateParams;
      $app = $(this);
      inputs = {
        $dataSize: $app.find("[dremio-calc='dataSize']"),
        $numSystems: $app.find("[dremio-calc='numSystems']"),
        $numAnalysts: $app.find("[dremio-calc='numAnalysts']"),
        $numScientists: $app.find("[dremio-calc='numScientists']")
      };
      outputs = {
        $techCosts: $app.find("[dremio-calc='techCosts']"),
        $peopleCosts: $app.find("[dremio-calc='peopleCosts']"),
        $totalCosts: $app.find("[dremio-calc='totalCosts']")
      };
      vals = vals || {
        minData: 10,
        minSourceSystems: 5,
        minPeopleSaved: 0.5,
        dataEngineer: 0.02,
        dataSourceMultiple: 0.2,
        costOfITPro: 120000,
        annualServerCost: 18000,
        annualSoftwareFees: 10000,
        dataPipeline: 0.3,
        storageSavings: 0.93,
        storageCostPerTB: 6500
      };
      updateFromParams = function() {
        var i, k, params, results, v;
        params = window.location.hash.replace(/\#/g, '');
        if (params !== '') {
          params = params.split('&');
          i = 0;
          results = [];
          while (i < params.length) {
            k = params[i].split('=')[0];
            v = params[i].split('=')[1];
            $('[dremio-calc=\'app\']').find('[dremio-calc=\'' + k + '\']').val(v);
            results.push(i++);
          }
          return results;
        }
      };
      updateFromParams();
      animateVal = function($input, newVal) {
        var oldVal;
        oldVal = parseInt($input.val().replace(/\D/g, ''));
        return $({
          val: oldVal
        }).animate({
          val: newVal
        }, {
          duration: 1000,
          easing: 'linear',
          step: function(val) {
            val = parseInt(val);
            return $input.val("$" + val.toLocaleString());
          }
        });
      };
      doCalc = function() {
        var dataSize, dataSourcePeopleFactor, numAnalysts, numScientists, numSystems, peopleCosts, peopleFactor, serverCosts, storageCosts, techCosts, totalCosts;
        dataSize = parseInt(inputs.$dataSize.val() || 0);
        numSystems = parseInt(inputs.$numSystems.val() || 0);
        numAnalysts = parseInt(inputs.$numAnalysts.val() || 0);
        numScientists = parseInt(inputs.$numScientists.val() || 0);
        log(dataSize, numSystems, numAnalysts, numScientists);
        dataSourcePeopleFactor = Math.max(vals.dataSourceMultiple * numSystems, vals.minSourceSystems);
        peopleFactor = Math.max((numAnalysts + numScientists + dataSourcePeopleFactor) * vals.dataEngineer, vals.minPeopleSaved);
        storageCosts = Math.max(vals.minData, dataSize) * vals.storageCostPerTB;
        serverCosts = Math.max(vals.minSourceSystems, numSystems) * vals.dataPipeline * (vals.annualServerCost + vals.annualSoftwareFees);
        techCosts = storageCosts + serverCosts;
        peopleCosts = peopleFactor * vals.costOfITPro;
        totalCosts = techCosts + peopleCosts;
        animateVal(outputs.$techCosts, techCosts);
        animateVal(outputs.$peopleCosts, peopleCosts);
        return animateVal(outputs.$totalCosts, totalCosts);
      };
      updateParams = function() {
        var urlHashInput;
        urlHashInput = '';
        $.each(inputs, function(i, el) {
          var q;
          q = i.replace(/\$/g, '');
          return urlHashInput += q + '=' + $(el).val() + '&';
        });
        window.location.hash = urlHashInput.slice(0, -1);
        $('#share input').val(window.location.href + window.location.hash);
        return $('#share').show();
      };
      $("#share input").focus(function() { $(this).select(); } );;
      $("#share input").mouseup(function(e){ e.preventDefault(); });;
      $('#share input').val(window.location.href + window.location.hash);
      for (input in inputs) {
        $input = inputs[input];
        $input.on('input', {
          input: input
        }, function(e) {
          inputs[e.data.input].not(this).val($(this).val());
          doCalc();
          updateParams(inputs);
          return log('keyup', $(this).val(), e);
        });
        $input.on('blur', function(e) {
          if (!$(this).val()) {
            return $(this).val('0');
          }
        });
      }
      return doCalc();
    });
  };

}).call(this);
