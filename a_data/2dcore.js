function SimpleCad() {
    
    /**
     * Инициализирует CAD-блок и настраивает основные параметры.
     * @param {Object} config - Объект конфигурации для инициализации.
     */
    function initializeCadBlock(config) {
        // Устанавливаем глобальную переменную с переданным объектом конфигурации
        ei = config;
        isRotateClick = false;
        // Инициализируем CAD-блок по ID
        Ui = $("#" + ei.cad_block_id);

        // Устанавливаем смещения и масштаб по умолчанию
        So.x_offset = y_("default_params_x_offset");
        So.y_offset = y_("default_params_y_offset");
        Go.g_scale[vo] = y_("g_scale");

        // Если CAD-блок существует, инициализируем холст и параметры по умолчанию
        if (Ui.length !== 0) {
            initializeCanvas(); // Инициализация холста
            configureLayerSettings({
                type: "",
                history: false
            }); // Установка параметров по умолчанию
        }

        // Привязываем обработчик клика к кнопкам с классом "d_elements_button"
        $(".d_elements_button").click(function (event) {            
            handleElementButtonClick(event, $(this)); // Обработка клика по кнопке            
        });
        
        $magnet30.on('click', handlerMagnet30);
        $rotate.on('click', handlerRotate);
        
        // Привязываем обработчик события "keyup" к документу
        $(document).on("keyup", function (event) {
            handleKeyboardEvent(event); // Обработка событий клавиатуры
        });

        // Обработка события скрытия модального окна
        $("#modal_html").on("hide.bs.modal", function (event) {
            if (Bo === "roof_accessories_mch_pn") {
                // Предотвращаем стандартное поведение и показываем подтверждающее модальное окно
                event.preventDefault();
                event.stopPropagation();
                $("#modal_second_modal .modal_second_modal_one").hide();
                $("#modal_second_modal_confirm_accessories_mch_pn").show();
                $("#modal_second_modal").show();
                return false;
            } else {
                handleModalClose(event); // Обработка других событий скрытия модального окна
            }
        });

        // Инициализация дополнительных настроек
        z_();

        // Если тип CAD-блока "roof" или "sznde", загружаем дополнительные данные
        if (-1 !== $.inArray(ei.type, ["roof", "sznde"]) && typeof ei.access_data !== "undefined") {
            if (-1 !== $.inArray(ei.type, ["roof"])) {
                la(); // Настройки для "roof"
                K("pagination_releasenotes_list", { page: 1 }); // Загрузка списка релизов
            }

            K("user_settings_load", { page: 1 }); // Загрузка пользовательских настроек

            if (-1 !== $.inArray(ei.type, ["roof"])) {
                Xn(); // Дополнительная инициализация для "roof"
                Wn(); // Дополнительная инициализация для "roof"
            }
        }

        // Привязываем обработчик контекстного меню к CAD-блоку
        $("body").on("contextmenu", "#" + ei.cad_block_id, function (event) {
            return ma(event); // Обработка контекстного меню
        });

        // Отслеживаем движение мыши
        $(document).on("mousemove", function (event) {
            qi = event.pageX + "_" + event.pageY; // Сохраняем текущую позицию мыши
        });

        // Если тип CAD-блока "sznde", инициализируем специфические настройки
        if (-1 !== $.inArray(ei.type, ["sznde"])) {
            es(); // Инициализация для "sznde"
            ts(); // Дополнительная инициализация для "sznde"
            K("nde_nom_fields", {}); // Загрузка полей NDE
        }

        $('[data-element="pline"]').trigger('click')
    }

    /**
     * Обрабатывает события клавиатуры для управления CAD-блоком.
     * @param {KeyboardEvent} event - Событие клавиатуры.
     */
    function handleKeyboardEvent(event) {
        // Проверяем, если есть глобальная переменная Mo.nom_id_1c или тип CAD-блока равен "sznde"
        if (typeof Mo.nom_id_1c !== "undefined" || ei.type === "sznde") {
            // Обработка нажатий клавиш
            switch (event.keyCode) {
                case 18: // Alt
                    if (event.ctrlKey) {
                        console.log("Показать");
                    }
                    break;
                default:
                    break;
            }

            // Обработка режимов CAD-блока
            switch (Oo.mode) {
                case "default":
                    // Если есть активные элементы и не открыто модальное окно
                    if (Object.keys(oi).length > 0 && !$("body").hasClass("modal-open") && sl.css("display") === "block") {
                        switch (event.keyCode) {
                            case 37: // Стрелка влево
                                if (Mo.type === "mch_modul") {
                                    $("#roof_columns_sheet_btn_add_3").trigger("click");
                                }
                                break;
                            case 39: // Стрелка вправо
                                if (Mo.type === "mch_modul") {
                                    $("#roof_columns_sheet_btn_add_2").trigger("click");
                                }
                                break;
                            case 45: // Insert
                                if (["mch", "pn", "falc", "siding", "siding_vert"].includes(Mo.type)) {
                                    $("#roof_columns_sheet_btn_add").trigger("click");
                                }
                                break;
                            case 46: // Delete
                                $("#roof_columns_sheet_btn_delete").trigger("click");
                                break;
                            default:
                                break;
                        }
                    }

                    // Обработка сочетаний клавиш Ctrl+Y и Ctrl+Z
                    if (!$("body").hasClass("modal-open")) {
                        switch (event.keyCode) {
                            case 89: // Ctrl+Y
                                if (event.ctrlKey) {
                                    wl.trigger("click");
                                }
                                break;
                            case 90: // Ctrl+Z
                                if (event.ctrlKey) {
                                    xl.trigger("click");
                                }
                                break;
                            default:
                                break;
                        }
                    }
                    break;

                case "add_element":
                    // Передаём событие в функцию обработки добавления элемента
                    processKeyCode(event);
                    break;

                default:
                    break;
            }
        }    
    }

    /**
     * Обрабатывает код нажатой клавиши.
     * @param {KeyboardEvent} event - Событие клавиатуры.
     */
    function processKeyCode(event) {
        // Передаём код клавиши в функцию обработки
        handleKeyPress(event.keyCode);
    }

    /**
     * Сбрасывает активный элемент и очищает связанные данные.
     */
    function resetActiveElement() {
        // Удаляем активный элемент из глобального объекта
        Y({ id: Zi.id() });

        // Выполняем очистку и сброс параметров
        oe(); // Очистка таблицы объектов
        st(Zi); // Удаление связанных данных
        Je(Zi); // Очистка привязок
        bt(Zi.id()); // Удаление вспомогательных элементов
        ce(); // Скрытие вспомогательных элементов

        // Уничтожаем активный элемент
        Zi.destroy();

        // Перерисовываем текущий слой
        to[vo].draw();

        // Сбрасываем глобальные переменные
        Zi = "undefined";
        Ji = "undefined";
    }

    /**
     * Очищает временные элементы и сбрасывает активные данные.
     */
    function clearTemporaryElements() {
        // Очищаем таблицу объектов
        oe();

        // Уничтожаем временный элемент, если он существует
        if (Ji === "temp" || (Ji && typeof Ji.destroy === "function")) {
            Ji.destroy();
        }

        // Перерисовываем текущий слой
        to[vo].draw();

        // Сбрасываем глобальные переменные
        Ji = "undefined";
        Zi = "undefined";
    }

    /**
     * Инициализирует холст CAD-блока, устанавливает размеры и создает необходимые элементы управления.
     */
    function initializeCanvas() {
        // Получаем высоту корневого элемента
        var rootHeight = $("#r_d_root").attr("data-height");

        // Если высота не определена, устанавливаем её в зависимости от окна
        if (typeof rootHeight === "undefined" || rootHeight === "undefined") {
            $("#r_d_root").height($(window).height());
            Ui.height(
                $(window).height() -
                $("#r_d_nav_1").height() -
                $("#r_d_nav_2").height() -
                $("#r_d_nav_bot").height() -
                10
            );
        } else {
            rootHeight = parseInt(rootHeight);
            $("#r_d_root").height(rootHeight);
            Ui.height(rootHeight - 100);

            // Устанавливаем ширину, если она определена
            var rootWidth = $("#r_d_root").attr("data-width");
            if (typeof rootWidth === "undefined" || rootWidth === "undefined") {
                var windowWidth = $(window).width();
                if (windowWidth > 1241) {
                    Ui.width(1190);
                } else if (windowWidth > 1023 && windowWidth <= 1241) {
                    Ui.width(1000);
                } else {
                    Ui.width(windowWidth - 50);
                }
            } else {
                Ui.width(parseInt(rootWidth));
            }
        }

        // Инициализация элементов управления
        el = $("#d_elements_accordion");
        tl = $("#d_objects_accordion");
        _l = $("#add_object_table");
        al = $("#add_object_layer_row");
        rl = $("#add_sheet_tab");
        sl = $("#d_sheet_move_block");
        ol = $("#move_point_controller_x");
        il = $("#move_point_controller_y");
        ll = $("#move_point_controller_xp");
        cl = $("#move_point_controller_yp");
        dl = $("#move_point_controller_step");
        pl = $("#figure_move_controller_step");
        jl = $("#figure_move_controller_xp");
        Cl = $("#figure_move_controller_yp");
        ml = $("#roofstat_s_slope");
        hl = $("#roofstat_s_slope_figure");
        ul = $("#roofstat_s_sheets_full");
        fl = $("#roofstat_s_sheets_useful");
        gl = $("#roofstat_procent_waste");
        yl = $("#roofstat_slope_length");
        nl = $("#d_elements_button_select");
        bl = $("#coords_absolute");
        vl = $("#modal_info");
        xl = $("#cad_history_i_prev");
        wl = $("#cad_history_i_next");
        kl = $("#context_menu");
        zl = $("#token_data");
        Ll = $("#nde_tbl_row_size_ang_list");
        Ol = $("#nde_tbl_row_other_list");
        $magnet30 = $('[data-element="magnet_30"]');
        isRotateClick = false;
        $rotate = $('[data-element="rotate"]');

        // Создаем объект Konva.Stage для CAD-блока
        Bi = new Konva.Stage({
            container: "cad_block",
            width: Ui.width(),
            height: Ui.height()
        });

        // Отрисовываем холст
        Bi.draw();
    }

    /**
     * Увеличивает глобальный счетчик элементов.
     * Используется для генерации уникальных идентификаторов.
     */
    function incrementCounter() {
        // Увеличиваем значение глобального счетчика
        xo++;
    }

    /**
     * Увеличивает счетчик для указанного элемента.
     * Если элемент отсутствует в объекте `wo`, он инициализируется со значением 0.
     * @param {string} element - Имя элемента, для которого нужно увеличить счетчик.
     */
    function incrementElementCounter(element) {
        // Если элемент отсутствует в объекте `wo`, инициализируем его со значением 0
        if (typeof wo[element] === "undefined") {
            wo[element] = 0;
        }

        // Увеличиваем значение счетчика для элемента
        wo[element]++;
    }

    /**
     * Уменьшает счетчик для указанного элемента.
     * Если элемент отсутствует в объекте `wo`, он инициализируется со значением 0.
     * @param {string} element - Имя элемента, для которого нужно уменьшить счетчик.
     */
    function decrementElementCounter(element) {
        // Если элемент отсутствует в объекте `wo`, инициализируем его со значением 0
        if (typeof wo[element] === "undefined") {
            wo[element] = 0;
        }

        // Уменьшаем значение счетчика для элемента
        wo[element]--;
    }

    /**
     * Настраивает параметры слоя CAD-блока.
     * 
     * @param {Object} options - Объект с параметрами настройки.
     * @param {string} options.type - Тип действия (например, "add", "remove").
     * @param {boolean} options.history - Указывает, нужно ли сохранять изменения в истории.
     * @param {Object} [options.axis_point_tab_set] - Координаты точки оси.
     * @param {number} [options.axis_point_tab_set.g_x] - Координата X точки оси.
     * @param {number} [options.axis_point_tab_set.g_y] - Координата Y точки оси.
     * @param {boolean} [options.is_RoofSetCurrentLayerNameParams] - Указывает, нужно ли обновлять параметры текущего слоя для крыши.
     */
    function configureLayerSettings(options) {
        // Обновляем текущий слой
        u(vo);

        // Применяем настройки слоя
        initializeLayerElements(options);

        // Устанавливаем масштаб слоя, если он не определён
        if (typeof Go.g_scale[vo] === "undefined") {
            Go.g_scale[vo] = y_("g_scale");
        }

        // Устанавливаем координаты точки оси, если они переданы
        if (typeof options.axis_point_tab_set !== "undefined" &&
            typeof options.axis_point_tab_set.g_x !== "undefined" &&
            typeof options.axis_point_tab_set.g_y !== "undefined") {
            Fo[vo] = options.axis_point_tab_set.g_x;
            Ao[vo] = options.axis_point_tab_set.g_y;
        }

        // Выполняем обновление визуальных элементов слоя
        v();
        drawGrid();
        w();

        drawTable();

        // Показываем или скрываем элементы в зависимости от состояния
        if (No) {
            Vs[vo].show();
        } else {
            Vs[vo].hide();
        }

        // Выполняем дополнительные действия
        m();
        h(options);
        f(vo);
        pa();
        ae();

        // Если тип CAD-блока "roof" или "sznde", обновляем параметры слоя для крыши
        if ($.inArray(ei.type, ["roof", "sznde"]) !== -1 &&
            typeof options.is_RoofSetCurrentLayerNameParams !== "undefined" &&
            options.is_RoofSetCurrentLayerNameParams) {
            Ca();
            ca();
        }

        // Выполняем финальные действия
        Ra();
        Ha();
        Ja();
        Oa();

        // Если требуется сохранить изменения в истории, добавляем запись
        if (options.history) {
            di = {
                type: "h_sheet_add",
                tab_text: rl.find(".d_bottom_tab.active").html(),
                tab_num: rl.find(".d_bottom_tab.active").attr("data-layer-num"),
                need_axis: {
                    g_x: Fo[vo],
                    g_y: Ao[vo],
                    current_layer_name: vo
                }
            };

            An({
                mode: "add",
                element: di
            });
        }
    }

    function drawTable() {
        to[vo].add(co.arrow[vo]), $.each(["hor1", "hor2", "hor3", "ver1", "ver2", "ver3", "ver4", "ver5", "ver6", "ver7"], function(e, t) {
            po[t][vo] = new Konva.Line({
                points: [0, 0, 0, 0],
                stroke: "#333",
                strokeWidth: 2,
                tension: 1,
                draggable: !1,
                visible: !1,
                object_visible: 1,
                is_table_cad_block: !0
            }), to[vo].add(po[t][vo])
        })

        $.each(["h1", "h2", "h3", "h4", "h5", "h6", "r1v1", "r1v2", "r1v3", "r1v4", "r1v5", "r1v6"], function(e, t) {
            po[t][vo] = new Konva.Text({
                x: 100,
                y: 100,
                text: t,
                fontSize: 13,
                fontFamily: "Arial",
                fontStyle: "bold",
                fill: "#333",
                draggable: !1,
                visible: !1,
                listening: !1
            }), to[vo].add(po[t][vo])
        }), to[vo].draw();
    }

    function d(e, t) {
        t && (di = {
            type: "h_sheet_remove",
            tab_data: S_("h_sheet_remove"),
            need_axis: {
                g_x: Fo[vo],
                g_y: Ao[vo],
                current_layer_name: vo
            }
        }, An({
            mode: "add",
            element: di
        }));
        var _ = "layer_" + e,
            a = rl.find(".d_bottom_tab").length,
            r = "",
            n = "";
        switch (1 == a ? r = "click_add" : 1 < a && (1 == rl.find("[data-layer-num=\"" + e + "\"]").prev().length ? (r = "click_left", n = rl.find("[data-layer-num=\"" + e + "\"]").prev().attr("data-layer-num")) : 1 == rl.find("[data-layer-num=\"" + e + "\"]").next().length && (r = "click_right", n = rl.find("[data-layer-num=\"" + e + "\"]").next().attr("data-layer-num"))), "undefined" != typeof Ks[_] && (Ks[_].destroy(), delete Ks[_]), delete Ws[_], $("#canvas_" + e).remove(), delete Ns[_], delete Vs[_], delete $s[_], delete Es[_], "undefined" != typeof Ms[_] && (Ms[_].destroyChildren(), delete Ms[_]), delete Rs[_], Hs[_].destroyChildren(), delete Hs[_], Bs[_].destroyChildren(), delete Bs[_], Zs[_].destroyChildren(), delete Zs[_], to[_].destroyChildren(), to[_].destroy(), delete to[_], delete Go.g_scale[_], delete Mo.cornice[_], delete Mo.direction[_], delete Mo.direction_y[_], delete Mo.offset_x[_], delete Mo.offset_y[_], delete Mo.sheet_max_length[_], delete Mo.tabs_re_roof[_], delete Mo.offset_run_type[_], delete Mo.sheet_length_text_mode[_], delete Fo[_], delete Ao[_], rl.find("[data-layer-num=\"" + e + "\"]").remove(), al.find("[data-current_layer_name=\"" + _ + "\"]").remove(), r) {
            case "click_add":
                SimpleCad.Action({
                    type: "SheetAdd",
                    target: "",
                    history: !1
                });
                break;
            case "click_left":
            case "click_right":
                rl.find("[data-layer-num=\"" + n + "\"]").trigger("click");
                break;
            default:
        }
        Oa(), $("#modal_html").modal("hide")
    }

    function p() {
        $.each(Ws, function(e) {
            Ws[e] = null, delete Ws[e]
        }), Ws = null, Ws = {}, $.each(to, function(e) {
            to[e].destroyChildren(), to[e].destroy(), to[e] = null, delete to[e]
        }), to = null, to = {}, $.each(Ks, function(e) {
            Ks[e].destroy(), Ks[e] = null, delete Ks[e]
        }), Ks = null, Ks = {}, Ns = JSON.DestroyKonva(Ns, 1, !0), Vs = JSON.DestroyKonva(Vs, 1, !0), $s = JSON.DestroyKonva($s, 1, !0), Es = JSON.DestroyKonva(Es, 1, !0), Rs = JSON.DestroyKonva(Rs, 1, !0), Hs = JSON.DestroyKonva(Hs, 1, !0), Bs = JSON.DestroyKonva(Bs, 1, !0), Zs = JSON.DestroyKonva(Zs, 1, !0), _o = JSON.DestroyKonva(_o, 1, !1), oo = JSON.DestroyKonva(oo, 2, !1), go = JSON.DestroyKonva(go, 1, !1), fo = JSON.DestroyKonva(fo, 1, !1), io = JSON.DestroyKonva(io, 2, !1), no = JSON.DestroyKonva(no, 1, !1), so = JSON.DestroyKonva(so, 1, !1), ro = JSON.DestroyKonva(ro, 1, !1), qo = JSON.DestroyKonva(qo, 2, !1), Ms = JSON.DestroyKonva(Ms, 1, !0), co = JSON.DestroyKonva(co, 2, !1), co = {
            arrow: {}
        }, po = JSON.DestroyKonva(po, 2, !1), po = {
            hor1: {},
            hor2: {},
            hor3: {},
            ver1: {},
            ver2: {},
            ver3: {},
            ver4: {},
            ver5: {},
            ver6: {},
            ver7: {},
            h1: {},
            h2: {},
            h3: {},
            h4: {},
            h5: {},
            h6: {},
            r1v1: {},
            r1v2: {},
            r1v3: {},
            r1v4: {},
            r1v5: {},
            r1v6: {}
        }, yo = -1, bo = -1, vo = "", xo = 1e5, wo = {}, ko = 1, jo = 1, zo = 1, To = {}, ui = {}, Ro = -1, Eo = "to_axis", Fo = {}, Ao = {}, An({
            mode: "clear"
        }), Go = {
            g_scale: {}
        }, rl.html(""), al.html(""), Bi.clear(), Bi = new Konva.Stage({
            container: "cad_block",
            width: Ui.width(),
            height: Ui.height()
        }), Bi.draw()
    }

    function m() {
        $s[vo] = new Konva.Group({
            x: 0,
            y: 0,
            id: "size_group__" + yo
        }), to[vo].add($s[vo]), Es[vo] = new Konva.Group({
            x: 0,
            y: 0,
            id: "pline_breaks_group__" + yo
        }), to[vo].add(Es[vo]), Bs[vo] = new Konva.Group({
            x: 0,
            y: 0,
            id: "roof_sheets_group__" + yo
        }), to[vo].add(Bs[vo]), Vo ? Bs[vo].show() : Bs[vo].hide(), Rs[vo] = new Konva.Group({
            x: 0,
            y: 0,
            id: "linestartend_group__" + yo
        }), to[vo].add(Rs[vo]), Hs[vo] = new Konva.Group({
            x: 0,
            y: 0,
            id: "objsnap_group__" + yo
        }), to[vo].add(Hs[vo]), Zs[vo] = new Konva.Group({
            x: 0,
            y: 0,
            id: "move_points_group__" + yo
        }), to[vo].add(Zs[vo])
    }

    function h(e) {
        var t = "";
        if ("undefined" != typeof e.set_tab_text) t = e.set_tab_text;
        else {
            switch (e.type) {
                case "nestdob":
                    t = "\u042D\u043B\u0435\u043C\u0435\u043D\u0442 " + (yo + 1);
                    break;
                case "":
                    t = "\u041B\u0438\u0441\u0442 " + (yo + 1);
                    break;
                case "roof":
                    t = yo + 1;
                    break;
                default:
            }
            switch (ei.type) {
                case "roof":
                case "sznde":
                    t = yo + 1;
                    break;
                default:
            }
            if ("undefined" != typeof Mo && "undefined" != typeof Mo.product_type) switch (Mo.product_type) {
                case "roof":
                    t = yo + 1;
                    break;
                case "fasad":
                    t = yo + 1;
                    break;
                default:
            }
        }
        rl.find(".active").removeClass("active"), rl.append("<div class=\"d_bottom_tab active\" data-layer-num=\"" + yo + "\" onclick=\"SimpleCad.Action({'type':'SheetClick','thisObject':$(this)})\">" + t + "</div>")
    }

    function u(e) {
        "undefined" != typeof to[e] && (to[e].hide(), to[e].draw())
    }

    function f(e) {
        "undefined" != typeof to[e] && (to[e].show(), to[e].draw(), al.find(".d_object").hide(), al.find("[data-current_layer_name=\"" + vo + "\"]").show())
    }

    function g(e) {
        var t = e.attr("data-layer-num");
        t = parseInt(t), t != yo && (u(vo), yo = t, vo = "layer_" + yo, f(vo), re(), e.addClass("active"), resetCADState(), ae(), da(), "undefined" == typeof ui[vo] && (ui[vo] = "1", Ke("+", "", !1, !1), Ke("-", "", !0, !0)), -1 !== $.inArray(ei.type, ["roof", "sznde"]) && ca(), 1 == Mo.tabs_re_roof[vo] && q_(), kl.hide(), $o = !1, zi = "")
    }

    function y() {}

    /**
     * Инициализирует слой CAD-редактора и добавляет все необходимые элементы взаимодействия.
     * 
     * @param {Object} e - Объект параметров для инициализации слоя
     * @param {number} [e.set_current_layer_num] - Номер слоя для инициализации. Если не задан, будет использовано значение счетчика.
     * @returns {void}
     */
    function initializeLayerElements(e) {
        // Определяем номер слоя: либо из параметров, либо инкрементируем счетчик
        if (typeof e.set_current_layer_num !== "undefined" && parseInt(e.set_current_layer_num) > -1) {
            yo = parseInt(e.set_current_layer_num);
        } else {
            bo++;
            yo = bo;
        }
        
        // Формируем имя слоя и создаем слой Konva
        vo = "layer_" + yo;
        to[vo] = new Konva.Layer({
            id: vo
        });
        
        // Добавляем слой на сцену и отрисовываем его
        Bi.add(to[vo]);
        to[vo].draw();
        
        // Создаем холст HTML5 для каждого слоя
        Ws[vo] = document.createElement("canvas");
        Ws[vo].width = Bi.width();
        Ws[vo].height = Bi.height();
        
        // Создаем изображение Konva для холста
        Ks[vo] = new Konva.Image({
            image: Ws[vo],
            fill: "#fff",
            id: "layer_image__" + yo
        });
        
        // Добавляем обработчики событий для изображения
        Ks[vo].on("click", function(e) {
            ye(e); // Обработчик клика
        });
        
        Ks[vo].on("mousemove", function(e) {
            handleCanvasMouseMove(e); // Обработчик движения мыши
        });
        
        Ks[vo].on("mousedown", function(e) {
            be(e); // Обработчик нажатия кнопки мыши
        });
        
        Ks[vo].on("mouseup", function(e) {
            ve(e); // Обработчик отпускания кнопки мыши
        });
        
        Ks[vo].on("wheel", function(e) {
            we(e); // Обработчик колесика мыши
        });
        
        // Добавляем изображение на слой
        to[vo].add(Ks[vo]);
        
        // Создаем линию для подсветки сегментов
        no[vo] = new Konva.Line({
            points: [0, 0, 0, 0],
            stroke: mainColors.segment_highlighter_hover,
            strokeWidth: 6,
            draggable: false,
            visible: false,
            object_visible: 1,
            parent_id: ""
        });

        // Добавляем обработчики событий для линии подсветки
        no[vo].on("mousemove", function(e) {               
            Rr(e.evt.layerX, e.evt.layerY, e.target.attrs.points); // Обработчик движения мыши над сегментом
        });
        
        no[vo].on("mouseleave", function() {
            // Скрываем подсветку при уходе курсора, если не активен режим выбора точки
            if (!pi) {
                no[vo].hide();
                so[vo].hide();
                to[vo].draw();
                mi = false;
            }
        });
        
        no[vo].on("click", function(e) {
            handleSegmentSelection(e); // Обработчик выбора сегмента
        });
        
        // Добавляем линию подсветки на слой
        to[vo].add(no[vo]);
        
        // Создаем круг для маркера точки
        so[vo] = new Konva.Circle({
            x: 0,
            y: 0,
            radius: 5,
            fill: "#ffc107",
            stroke: "black",
            strokeWidth: 1,
            parent_id: "",
            draggable: false,
            visible: false,
            object_visible: 1
        });
        
        // Добавляем маркер точки на слой
        to[vo].add(so[vo]);
        
        // Создаем вспомогательные линии для привязок к осям
        oo[vo] = {};
        
        // Горизонтальная линия привязки к оси
        oo[vo].x = new Konva.Line({
            points: [0, 0, 0, 0],
            stroke: mainColors.regard_axis_highlighter,
            strokeWidth: 1,
            draggable: false,
            visible: false,
            object_visible: 1,
            parent_id: "",
            dash: [15, 3] // Пунктирная линия
        });
        to[vo].add(oo[vo].x);
        
        // Вертикальная линия привязки к оси
        oo[vo].y = new Konva.Line({
            points: [0, 0, 0, 0],
            stroke: mainColors.regard_axis_highlighter,
            strokeWidth: 1,
            draggable: false,
            visible: false,
            object_visible: 1,
            parent_id: "",
            dash: [15, 3] // Пунктирная линия
        });
        to[vo].add(oo[vo].y);
        
        // Создаем линии для ортогональной привязки
        io[vo] = {};
        
        // Горизонтальная линия ортогональной привязки
        io[vo].x = new Konva.Line({
            points: [0, 0, 0, 0],
            stroke: mainColors.orto_axis_highlighter,
            strokeWidth: 1,
            draggable: false,
            visible: false,
            object_visible: 1,
            parent_id: "",
            dash: [15, 3] // Пунктирная линия
        });
        to[vo].add(io[vo].x);
        
        // Вертикальная линия ортогональной привязки
        io[vo].y = new Konva.Line({
            points: [0, 0, 0, 0],
            stroke: mainColors.orto_axis_highlighter,
            strokeWidth: 1,
            draggable: false,
            visible: false,
            object_visible: 1,
            parent_id: "",
            dash: [15, 3] // Пунктирная линия
        });
        to[vo].add(io[vo].y);
        
        // Создаем прямоугольник для выделения области мышью
        fo[vo] = new Konva.Rect({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            stroke: mainColors.mouse_select_rect_color,
            strokeWidth: 1,
            visible: false,
            draggable: false,
            fillEnabled: false,
            listening: false,
            object_visible: 1,
            parent_id: ""
        });
        to[vo].add(fo[vo]);
        
        // Создаем стрелку для обозначения стороны покраски
        co.arrow[vo] = new Konva.Arrow({
            points: [0, 0, 0, 0],
            pointerLength: 15,
            pointerWidth: 5,
            fill: "#333",
            stroke: "#333",
            strokeWidth: 2,
            draggable: false,
            visible: false,
            name: "side_okras_arrow"
        });
        
        // Устанавливаем ID для HTML-элемента canvas
        var t = $("#cad_block").find("canvas").length;
        if (t > 0) {
            $("#cad_block").find("canvas")[t - 1].id = "canvas_" + yo;
        }
    }

    function v() {
        "undefined" == typeof Fo[vo] && (Fo[vo] = parseInt(Bi.width() * So.x_offset)), "undefined" == typeof Ao[vo] && (Ao[vo] = parseInt(Bi.height() * So.y_offset)), qo[vo] = {}, Ns[vo] = new Konva.Group({
            x: 0,
            y: 0,
            id: "grid_group__" + yo
        }), to[vo].add(Ns[vo]), Ko ? Ns[vo].show() : Ns[vo].hide()
    }

    /**
     * Функция для рисования сетки на холсте.
     * Сетка рисуется по заданным параметрам и масштабу.
     */
    function drawGrid(e) {
        var gridInterval = y_("draw_grid_mult"); // Получаем интервал для рисования сетки
        To[vo] = 1 * Go.g_scale[vo] / 100; // Устанавливаем масштаб для текущей области
        // Рисуем вертикальные линии
        var verticalLineCount = Math.ceil(Bi.width() / To[vo]); // Количество вертикальных линий
        var verticalLinesToDraw = Math.ceil(Fo[vo] / To[vo]) + 1; // Количество линий для рисования
        var verticalLineKey = ""; // Ключ для вертикальных линий
        var drawnVerticalLines = {}; // Объект для отслеживания нарисованных вертикальных линий
        for (var lineIndex = -1 * verticalLinesToDraw; lineIndex <= verticalLineCount - verticalLinesToDraw + 1; lineIndex++) {
            if (1 == gridInterval || 0 == lineIndex % gridInterval) {
                verticalLineKey = "xgl_" + lineIndex; // Формируем ключ для линии
                drawnVerticalLines[verticalLineKey] = 1; // Добавляем ключ в объект отслеживания
                if (typeof qo[vo][verticalLineKey] === "undefined") {
                    incrementCounter(); // Увеличиваем счетчик
                    // Создаем новую линию
                    qo[vo][verticalLineKey] = new Konva.Line({
                        x: Fo[vo] + lineIndex * To[vo],
                        y: 0,
                        points: [0, 0, 0, Bi.height()],
                        stroke: mainColors.grid_color,
                        tension: 1,
                        strokeWidth: 1,
                        id: "line__" + xo,
                        object_visible: 1,
                        line_key: verticalLineKey,
                        visible: true
                    });
                    Ns[vo].add(qo[vo][verticalLineKey]); // Добавляем линию на холст
                } else {
                    // Обновляем существующую линию
                    qo[vo][verticalLineKey].setAttrs({
                        x: Fo[vo] + lineIndex * To[vo],
                        visible: true
                    });
                }
            }
        }
        // Рисуем горизонтальные линии
        var horizontalLineCount = Math.ceil(Bi.height() / To[vo]); // Количество горизонтальных линий
        var horizontalLinesToDraw = Math.ceil(Ao[vo] / To[vo]) + 1; // Количество линий для рисования
        for (var lineIndex = -1 * (horizontalLineCount - horizontalLinesToDraw + 1); lineIndex <= horizontalLinesToDraw; lineIndex++) {
            if (1 == gridInterval || 0 == lineIndex % gridInterval) {
                var horizontalLineKey = "ygl_" + lineIndex; // Формируем ключ для линии
                drawnVerticalLines[horizontalLineKey] = 1; // Добавляем ключ в объект отслеживания
                if (typeof qo[vo][horizontalLineKey] === "undefined") {
                    incrementCounter(); // Увеличиваем счетчик
                    // Создаем новую линию
                    qo[vo][horizontalLineKey] = new Konva.Line({
                        x: 0,
                        y: Ao[vo] - lineIndex * To[vo],
                        points: [0, 0, Bi.width(), 0],
                        stroke: "#eee",
                        tension: 1,
                        strokeWidth: 1,
                        id: "line__" + xo,
                        object_visible: 1,
                        line_key: horizontalLineKey,
                        visible: true,
                        zIndex: 1
                    });
                    Ns[vo].add(qo[vo][horizontalLineKey]); // Добавляем линию на холст
                } else {
                    // Обновляем существующую линию
                    qo[vo][horizontalLineKey].setAttrs({
                        y: Ao[vo] - lineIndex * To[vo],
                        visible: true
                    });
                }
            }
        }
        // Скрываем линии, которые не были нарисованы
        $.each(qo[vo], function(key, line) {
            if (typeof drawnVerticalLines[line.attrs.line_key] === "undefined") {
                line.hide(); // Скрываем линию, если она не в отслеживаемом объекте
            }
        });
    }

    function w() {
        var e = 0 <= Fo[vo] ? -Fo[vo] : 0,
            t = Bi.width() - Fo[vo] - 10,
            _ = Bi.height() - Ao[vo],
            a = 0 <= Ao[vo] ? -Ao[vo] + 20 : Ao[vo];
        if ("undefined" == typeof Vs[vo]) {
            Vs[vo] = new Konva.Group({
                x: 0,
                y: 0,
                id: "axis_group__" + yo
            });
            var r = new Konva.Line({
                x: Fo[vo],
                y: Ao[vo],
                points: [0, _, 0, a],
                fill: "#333",
                stroke: "#333",
                strokeWidth: 1,
                arrowType: "y"
            });
            Vs[vo].add(r);
            var n = new Konva.Line({
                x: Fo[vo],
                y: Ao[vo],
                points: [e, 0, t, 0],
                fill: "#333",
                stroke: "#333",
                strokeWidth: 1,
                arrowType: "x"
            });
            Vs[vo].add(n), to[vo].add(Vs[vo])
        } else $.each(Vs[vo].children, function(r, n) {
            switch (n.attrs.arrowType) {
                case "x":
                    n.setAttrs({
                        x: Fo[vo],
                        y: Ao[vo],
                        points: [e, 0, t, 0]
                    });
                    break;
                case "y":
                    n.setAttrs({
                        x: Fo[vo],
                        y: Ao[vo],
                        points: [0, _, 0, a]
                    });
                    break;
                default:
            }
        })
    }

    /**
     * Обрабатывает клик по кнопке элемента в панели инструментов CAD.
     * Переключает режим работы редактора в зависимости от выбранного инструмента.
     * 
     * @param {Event} e - Объект события клика.
     * @param {jQuery} t - jQuery-объект кнопки, на которую кликнули.
     */
    function handleElementButtonClick(e, t) {
        // Проверка для SZNDE-типа: запрещаем выбор инструментов pline и figure_nde, если уже есть элемент
        if (-1 !== $.inArray(ei.type, ["sznde"]) && 
            -1 !== $.inArray(t.attr("data-element"), ["pline", "figure_nde"]) && 
            0 < b_()) {
            // Показываем уведомление об ошибке
            Yn({
                text: "\u0423\u0434\u0430\u043B\u0438\u0442\u0435 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u044D\u043B\u0435\u043C\u0435\u043D\u0442",
                type: "error"
            });
            return;
        }
        
        if (Oo.mode == 'add_element') {
            gs();
            // TODO: нужно отследить рисование, т.к. тут удаляется последняя точка.
    
            polylineId = Zi.id();
            let points = Zi.points();
            points = points.slice(0, points.length - 2);        
    
            Zi.setPoints(points);
            processAndClearElement(Zi);
            yt(Zi.id(), false);
            processElementAndAddMovePoints(Zi, false);        
    
            En();
    
            gs();
        }

        // Очищаем текущее состояние редактора
        resetCADState();
        
        // Сбрасываем активный элемент
        Zi = "undefined";
        
        // Отмечаем кнопку как активную в интерфейсе
        t.addClass("active");
        
        // Обработка в зависимости от типа выбранного инструмента
        switch (t.attr("data-element")) {
            case "select":
                // Включаем режим выбора элементов
                setDefaultMode();
                break;
                
            case "moveall":
                // Включаем режим перемещения всего содержимого
                ge();
                break;
                
            case "line":
            case "pline":
            case "text":
            case "arrow":
                // Включаем режим добавления элементов (линия, полилиния, текст, стрелка)
                var _ = {
                    mode: "add_element",
                    "data-element": t.attr("data-element")
                };
                ue(_);
                break;
                
            case "lineblock":
                // Для блока линий открываем модальное окно
                setDefaultMode();
                SimpleCad.Action({
                    type: "ModalShow",
                    target: "lineblock"
                });
                // Снимаем выделение с кнопки, так как будет использоваться модальное окно
                t.removeClass("active");
                break;
                
            case "figure":
                // Для фигур открываем модальное окно выбора фигуры
                setDefaultMode();
                SimpleCad.Action({
                    type: "ModalShow",
                    target: "figure"
                });
                // Снимаем выделение с кнопки, так как будет использоваться модальное окно
                t.removeClass("active");
                break;
                
            case "figure_nde":
                // Для доборных элементов открываем специальное модальное окно
                setDefaultMode();
                SimpleCad.Action({
                    type: "ModalShow",
                    target: "figure_nde"
                });
                // Снимаем выделение с кнопки, так как будет использоваться модальное окно
                t.removeClass("active");
                break;
                
            default:
                // Для неизвестных типов элементов действия не определены
        }
    }

    // Заменяем оригинальную функцию k новой функцией с понятным именем
    k = handleElementButtonClick;

    function z(e) {
        var t;

        // Determine the action based on the current data-element mode
        switch (Oo["data-element"]) {
            case "default":
                // Do nothing for the default mode
                break;

            case "line":
                // Handle the creation of a line
                if ("undefined" != typeof Zi && "undefined" !== Zi && "Line" == Zi.className) {
                    var points = Zi.points();
                    // Update the line's endpoint based on the current mouse position
                    if ("" == Fl) {
                        points[2] = e.evt.layerX;
                        points[3] = e.evt.layerY;
                    } else {
                        points[2] = Fl;
                        points[3] = Al;
                    }

                    Zi.setPoints(points);
                    Zi.stroke(mainColors.default_element_color);
                    yt(Zi.id(), false);
                }

                // Finalize the line creation
                incrementCounter();
                incrementElementCounter(Oo["data-element"]);

                var startX = 0, startY = 0;
                if ("" == Fl) {
                    startX = e.evt.layerX;
                    startY = e.evt.layerY;
                } else {
                    startX = Fl;
                    startY = Al;
                }

                // Create a new line element
                t = new Konva.Line({
                    points: [startX, startY, startX, startY],
                    stroke: mainColors.selected_element_color,
                    strokeWidth: 2,
                    id: Oo["data-element"] + "__" + xo,
                    name: "Линия " + wo[Oo["data-element"]],
                    draggable: false,
                    object_visible: 1
                });

                // Attach event listeners to the line
                t.on("click", function(e) {
                    handleElementClick(e, "line");
                });
                t.on("mousemove", function(e) {
                    handleMouseMove(e);
                });

                // Add the line to the canvas
                j(t);
                l_("btn_finish_cad_draw");
                break;

            case "pline":
                // Handle the creation of a polyline
                if ("undefined" == typeof Zi || "undefined" == Zi) {
                    var startX = 0, startY = 0;
                    if ("" == Fl) {
                        startX = e.evt.layerX;
                        startY = e.evt.layerY;
                    } else {
                        startX = Fl;
                        startY = Al;
                    }

                    // Create a new polyline element
                    t = createPolyline({
                        points: [startX, startY, startX, startY]
                    });

                    // Add the polyline to the canvas
                    j(t);
                    Ji = "undefined";
                    l_("btn_finish_cad_draw");
                    $n(startX, startY);
                } else {
                    // Extend the existing polyline
                    var isSnapped = false;
                    var points = Zi.points();
                    var length = points.length;
                    var indices = {
                        0: length - 4,
                        1: length - 3,
                        2: length - 2,
                        3: length - 1
                    };

                    var startX = 0, startY = 0;
                    if ("" == Fl) {
                        startX = e.evt.layerX;
                        startY = e.evt.layerY;
                    } else {
                        startX = Fl;
                        startY = Al;
                        isSnapped = true;
                    }

                    // Если Shift зажат, корректируем координаты для угла 30 градусов
                    if (checkMagnet30(event.evt)) {
                        var deltaX = startX - points[indices[0]];
                        var deltaY = startY - points[indices[1]];
                        var angle = Math.atan2(deltaY, deltaX); // Вычисляем угол в радианах
                        var angleInDegrees = angle * (180 / Math.PI);
                        // Приводим угол к ближайшему кратному 30 градусов
                        var snappedAngle = Math.round(angle / (Math.PI / 6)) * (Math.PI / 6);

                        // Вычисляем новые координаты с учётом привязки к углу
                        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                        startX = points[indices[0]] + distance * Math.cos(snappedAngle);
                        startY = points[indices[1]] + distance * Math.sin(snappedAngle);
                    }

                    // Snap to grid if necessary
                    if (lo.y) {
                        startX = io[vo].y.points()[0];
                    } else if (lo.x) {
                        startY = io[vo].x.points()[1];
                    }

                    if (!isSnapped) {
                        var distance = 100 * Math.dist(points[indices[0]], points[indices[1]], startX, startY) / Go.g_scale[vo];
                        var angle = calculateAngle(points[indices[0]], -1e4, points[indices[0]], points[indices[1]], startX, startY, true, true, false);

                        if ("sznde" == ei.type) {
                            distance = Math.round_precision(distance, 1);
                            angle = Math.round_precision_nearest(angle, 1);
                        } else {
                            distance = parseFloat(distance.toFixed(2));
                            angle = Math.round(angle);
                        }

                        var newPoint = Ie(points[indices[0]], points[indices[1]], distance, true, angle);
                        startX = newPoint.points[2];
                        startY = newPoint.points[3];
                    }

                     

                    // Update the polyline's points
                    points[indices[2]] = startX;
                    points[indices[3]] = startY;
                    yt(Zi.id(), false);
                    processElementAndAddMovePoints(Zi, false);
                    points.push(startX, startY);
                    Zi.setPoints(points);

                    // Enable the close button if the polyline has enough points
                    if (points.length >= 8 && "roof" == ei.type) {
                        l_("btn_finish_cad_draw_close");
                    }

                    // Create a new segment for the polyline
                    t = new Konva.Line({
                        points: [startX, startY, startX, startY],
                        stroke: mainColors.selected_element_color,
                        strokeWidth: 2,
                        draggable: false,
                        object_visible: 1
                    });

                    Ji = t;
                    to[vo].add(t);
                    to[vo].draw();
                    $n(startX, startY);
                }
                break;

            case "text":
                // Handle the creation of a text element
                incrementCounter();
                incrementElementCounter(Oo["data-element"]);

                t = new Konva.Text({
                    x: e.evt.layerX,
                    y: e.evt.layerY,
                    text: "Текст",
                    fontSize: 18,
                    fontFamily: "Arial",
                    fill: mainColors.selected_element_color,
                    id: Oo["data-element"] + "__" + xo,
                    name: "Текст " + wo[Oo["data-element"]],
                    draggable: false
                });

                // Attach event listeners to the text element
                t.on("click", function(e) {
                    handleElementClick(e, "text");
                });
                t.on("mousemove", function(e) {
                    handleMouseMove(e);
                });

                // Add the text element to the canvas
                j(t);
                break;

            case "arrow":
                // Handle the creation of an arrow
                switch (Oo.arrow_submode) {
                    case "default":
                        // Start the arrow creation
                        Oo.arrow_submode = "second";
                        incrementCounter();
                        incrementElementCounter(Oo["data-element"]);

                        t = new Konva.Arrow({
                            points: [e.evt.layerX, e.evt.layerY, e.evt.layerX, e.evt.layerY],
                            pointerLength: 15,
                            pointerWidth: 5,
                            fill: mainColors.selected_element_color,
                            stroke: mainColors.selected_element_color,
                            strokeWidth: 2,
                            id: Oo["data-element"] + "__" + xo,
                            name: "Стрелка " + wo[Oo["data-element"]],
                            draggable: false
                        });

                        // Attach event listeners to the arrow
                        t.on("click", function(e) {
                            handleElementClick(e, "arrow");
                        });
                        t.on("mousemove", function(e) {
                            handleMouseMove(e);
                        });

                        // Add the arrow to the canvas
                        j(t);
                        break;

                    case "second":
                        // Finalize the arrow creation
                        var points = Zi.points();
                        points[2] = e.evt.layerX;
                        points[3] = e.evt.layerY;
                        Zi.setPoints(points);
                        Zi.stroke(mainColors.default_element_color);
                        Oo.arrow_submode = "default";
                        break;

                    default:
                }
                break;

            case "rect":
                // Placeholder for rectangle creation
                break;

            case "circle":
                // Placeholder for circle creation
                break;

            default:
        }
    }

    function j(e) {
        ie(), to[vo].add(e), to[vo].draw(), Zi = e, se(), I({
            "data-element": Oo["data-element"],
            id: Zi.id()
        })
    }

    function C(e) {
        var t = e[0].attributes["data-obj-element"].value;
        if ("sznde" != ei.type || "pline" != t) {
            var _ = e[0].attributes["data-obj-id"].value;
            T(_, {})
        }
    }

    /**
     * Обрабатывает событие клика на элементе в зависимости от текущего режима.
     *
     * @param {Object} event - Событие клика.
     * @param {string} elementType - Тип элемента (например, "line", "pline", "text", "arrow").
     * @returns {boolean|void} - Возвращает `false`, если обработка завершена, иначе ничего.
     */
    function handleElementClick(event, elementType) {
        // Если нажата правая кнопка мыши, обрабатываем контекстное меню
        if (event.evt.button === 2) {
            if (elementType === "pline") {
                ga(event.target, event.evt.layerX, event.evt.layerY); // Обработка контекстного меню для полилинии
            }
            return false;
        }

        // Обработка в зависимости от текущего режима
        switch (Oo.mode) {
            case "default":
                // В режиме по умолчанию выбираем элемент
                var elementId = event.target.attrs.id;
                T(elementId, {}); // Выбор элемента
                break;

            case "add_element":
                // В режиме добавления элемента передаём событие в обработчик
                ye(event);
                break;

            default:
                // Для других режимов обработка не предусмотрена
        }
    }

    /**
     * Обрабатывает событие перемещения мыши над элементом.
     *
     * @param {Object} event - Событие перемещения мыши.
     */
    function handleMouseMove(event) {
        // Вызываем функцию обработки перемещения мыши
        handleCanvasMouseMove(event);
    }

    function F(e) {
        var t = e.parent().parent().find(".d_object_name");
        t = t[0].attributes["data-obj-id"].value;
        var _ = t.substr(0, t.indexOf("__"));
        if ("sznde" != ei.type || "pline" != _) {
            var a = Bi.findOne("#" + t);
            switch (_) {
                case "text":
                    e.hasClass("fa-eye") ? (a.attrs.is_object_visible = 0, a.hide(), "undefined" != typeof Zi && "undefined" !== Zi && Zi.id() == t && ce()) : (a.attrs.is_object_visible = 1, a.show(), "undefined" != typeof Zi && "undefined" !== Zi && Zi.id() == t && le());
                    break;
                case "pline":
                case "line":
                case "lineblock":
                    if (Fi && (di = {
                            type: "h_click_object_visible",
                            need_layer_num: yo,
                            element_id: t,
                            need_axis: {
                                g_x: Fo[vo],
                                g_y: Ao[vo],
                                current_layer_name: vo
                            }
                        }, An({
                            mode: "add",
                            element: di
                        })), Fi = !0, e.hasClass("fa-eye")) switch (a.attrs.is_object_visible = 0, a.hide(), st(a), Je(a), bt(a.id()), removeChildElementsByParentId(a.id()), $_(a.id()), "undefined" != typeof Zi && "undefined" !== Zi && Zi.id() == t && ce(), _) {
                        case "line":
                        case "pline":
                            A(a.id());
                            break;
                        default:
                    } else a.attrs.is_object_visible = 1, a.show(), processAndClearElement(a), He(a), vt(a, !1), processElementAndAddMovePoints(a, !1), N_(a), "lineblock" != _ && "undefined" != typeof Zi && "undefined" !== Zi && Zi.id() == t && le();
                    switch (_) {
                        case "lineblock":
                            processElementById(a.attrs.parent_id);
                            var r = Bi.findOne("#" + a.attrs.parent_id);
                            He(r);
                            break;
                        default:
                    }
                    to[vo].batchDraw(), $a(), k_(), da();
                    break;
                default:
            }
            e.toggleClass("fa-eye"), e.toggleClass("fa-eye-slash"), to[vo].batchDraw()
        }
    }

    function A(e) {
        $.each(to[vo].children, function(t, _) {
            var a = _.attrs.id;
            if ("undefined" != typeof a) {
                var r = a.substr(0, a.indexOf("__"));
                switch (r) {
                    case "lineblock":
                        if (_.attrs.parent_id == e) {
                            _.hide();
                            var n = al.find("[data-obj-id=\"" + _.id() + "\"]").parent().find(".fa");
                            n.removeClass("fa-eye"), n.addClass("fa-eye-slash")
                        }
                        break;
                    default:
                }
            }
        })
    }

    function q(e) {
        for (var t = to[vo].children.length, _ = t - 1; 0 <= _; _--) {
            var a = to[vo].children[_],
                r = a.attrs.id;
            if ("undefined" != typeof r) {
                var n = r.substr(0, r.indexOf("__"));
                switch (n) {
                    case "lineblock":
                        a.attrs.parent_id == e && (Y({
                            id: a.id()
                        }), st(a), bt(a.id()), a.destroy());
                        break;
                    default:
                }
            }
        }
    }

    function T(e, t) {
        "undefined" == typeof t.is_move_show && (t.is_move_show = !0), resetCADState(), setDefaultMode(), S(e, {
            is_move_show: t.is_move_show
        }), P(e), D(), j_()
    }

    function S(e, t) {
        if (Zi = Bi.findOne("#" + e), "undefined" !== Zi) {
            switch (Zi.className) {
                case "Line":
                    Zi.stroke(mainColors.selected_element_color);
                    break;
                case "Arrow":
                    Zi.stroke(mainColors.selected_element_color), Zi.fill(mainColors.selected_element_color);
                    break;
                case "Text":
                    Zi.fill(mainColors.selected_element_color);
                    break;
                default:
            }
            Zi.draw();
            var _ = e.substr(0, e.indexOf("__"));
            "lineblock" != _ && Zi.isVisible() && (t.is_move_show && le(), He(Zi))
        }
    }

    function P(e) {
        al.find("[data-obj-id=\"" + e + "\"]").parent().addClass("active")
    }

    function I(e) {
        var t = "",
            _ = !1;
        switch (e["data-element"]) {
            case "rect":
                break;
            case "line":
                t = "\u041B\u0438\u043D\u0438\u044F " + wo[e["data-element"]], _ = !0;
                break;
            case "lineblock":
                t = e.name, _ = !0;
                break;
            case "pline":
                t = y_("object_add_layer_row__pline") + " " + wo[e["data-element"]], _ = !0;
                break;
            case "text":
                t = "\u0422\u0435\u043A\u0441\u0442 " + wo[e["data-element"]], _ = !0;
                break;
            case "arrow":
                t = "\u0421\u0442\u0440\u0435\u043B\u043A\u0430 " + wo[e["data-element"]], _ = !0;
                break;
            default:
        }
        if (_) {
            var a = {
                    current_layer_name: vo,
                    data_id: e.id,
                    data_element: e["data-element"],
                    text: t
                },
                r = "<div class=\"d_object d_object___" + e["data-element"] + " active\" data-current_layer_name=\"" + a.current_layer_name + "\">\t<div class=\"d_object_visible\" >\t<i class=\"fa fa-eye\" onclick=\"SimpleCad.Action({'type':'Element_Click_OnObjectLayer_Vsisble','thisObject':$(this)})\"></i></div>\t<div class=\"d_object_name\" data-obj-id=\"" + a.data_id + "\" data-obj-element=\"" + a.data_element + "\" onclick=\"SimpleCad.Action({'type' : 'Element_Click_OnObjectLayer','thisObject': $(this)})\" >" + a.text + "</div></div>";
            $("#add_object_layer_row").append(r)
        }
    }

    function Y(e) {
        al.find("[data-obj-id=\"" + e.id + "\"]").parent().remove()
    }

    function D() {
        var e = 0,
            t = {
                type: "input_text",
                prop_name: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435",
                value: Zi.attrs.name,
                placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435",
                functions: [{
                    type: "oninput",
                    name: "SimpleCad.Action",
                    param: "{'type':'ObjectTablePropsInputChange','thisObject':$(this)}"
                }, {
                    type: "onkeyup",
                    name: "SimpleCad.Action",
                    param: "{'type':'ObjectTablePropsInputChangeKeyup','eventObject':event,'thisObject':$(this)}"
                }],
                data_params: [{
                    name: "data-change-element-param",
                    param: "name"
                }, {
                    name: "data-focus",
                    param: e
                }]
            };
        switch (te(t), e++, Zi.className) {
            case "Line":
            case "Arrow":
                var _ = Zi.id();
                if (-1 < _.indexOf("__")) {
                    var a = _.substr(0, _.indexOf("__"));
                    switch (a) {
                        case "line":
                        case "pline":
                        case "arrow":
                            for (var r = Zi.points(), n = r.length, s = 0, o = 0, l = 0, c = 0, d = 0, p = 0; p < (n - 2) / 2; p++) l = Te(r[2 * c + 0], r[2 * c + 1], r[2 * c + 2], r[2 * c + 3], !1), s = 100 * l / Go.g_scale[vo], o += s, t = {
                                type: "input_text",
                                prop_name: y_("table_build_element_length_text_" + a) + " " + (c + 1),
                                value: ut(s.toFixed(yi.length.prec)),
                                placeholder: y_("table_build_element_length_text_" + a) + " " + (c + 1),
                                functions: [{
                                    type: "oninput",
                                    name: "SimpleCad.Action",
                                    param: "{'type':'ObjectTablePropsInputChange','thisObject':$(this)}"
                                }, {
                                    type: "onkeyup",
                                    name: "SimpleCad.Action",
                                    param: "{'type':'ObjectTablePropsInputChangeKeyup','eventObject':event,'thisObject':$(this)}"
                                }, {
                                    type: "onblur",
                                    name: "SimpleCad.Action",
                                    param: "{'type':'object_table_props_input_blur','thisObject':$(this)}"
                                }, {
                                    type: "onfocus",
                                    name: "SimpleCad.Action",
                                    param: "{'type':'object_table_props_input_focus','thisObject':$(this)}"
                                }],
                                data_params: [{
                                    name: "data-change-element-param",
                                    param: "line_length"
                                }, {
                                    name: "data-param",
                                    param: c.toString()
                                }, {
                                    name: "data-validate-type",
                                    param: "numeric"
                                }, {
                                    name: "data-focus",
                                    param: e
                                }],
                                readonly: y_("table_build_element_length_readonly")
                            }, te(t), e++, c++;
                            c = 0;
                            for (var p = 0; p < (n - 2) / 2; p++) 0 == c && (d = calculateAngle(r[0], -1e4, r[0], r[1], r[2], r[3], !0, !0, !1), t = {
                                type: "input_text",
                                prop_name: "\u0423\u0433\u043E\u043B y_1",
                                value: ut(d.toFixed(2)),
                                placeholder: "\u0423\u0433\u043E\u043B y_1",
                                functions: [{
                                    type: "oninput",
                                    name: "SimpleCad.Action",
                                    param: "{'type':'ObjectTablePropsInputChange','thisObject':$(this)}"
                                }, {
                                    type: "onkeyup",
                                    name: "SimpleCad.Action",
                                    param: "{'type':'ObjectTablePropsInputChangeKeyup','eventObject':event,'thisObject':$(this)}"
                                }],
                                data_params: [{
                                    name: "data-change-element-param",
                                    param: "lines_angle"
                                }, {
                                    name: "data-param",
                                    param: "y"
                                }, {
                                    name: "data-validate-type",
                                    param: "numeric"
                                }, {
                                    name: "data-focus",
                                    param: e
                                }],
                                readonly: y_("table_build_element_angle_readonly")
                            }, te(t), e++), c + 2 < n / 2 && (d = calculateAngle(r[2 * c + 0], r[2 * c + 1], r[2 * c + 2], r[2 * c + 3], r[2 * c + 4], r[2 * c + 5], !0, !0, !1), t = {
                                type: "input_text",
                                prop_name: "\u0423\u0433\u043E\u043B " + (c + 1) + "_" + (c + 2),
                                value: ut(d.toFixed(2)),
                                placeholder: "\u0423\u0433\u043E\u043B " + (c + 1) + "_" + (c + 2),
                                functions: [{
                                    type: "oninput",
                                    name: "SimpleCad.Action",
                                    param: "{'type':'ObjectTablePropsInputChange','thisObject':$(this)}"
                                }, {
                                    type: "onkeyup",
                                    name: "SimpleCad.Action",
                                    param: "{'type':'ObjectTablePropsInputChangeKeyup','eventObject':event,'thisObject':$(this)}"
                                }],
                                data_params: [{
                                    name: "data-change-elemnt-param",
                                    param: "lines_angle"
                                }, {
                                    name: "data-param",
                                    param: c.toString()
                                }, {
                                    name: "data-validate-type",
                                    param: "numeric"
                                }, {
                                    name: "data-focus",
                                    param: e
                                }],
                                readonly: y_("table_build_element_angle_readonly")
                            }, te(t), e++), c++;
                            switch (a) {
                                case "pline":
                                    if (t = {
                                            type: "input_text",
                                            prop_name: y_("all_pline_length_as_perimetr"),
                                            value: ut(o.toFixed(yi.length.prec)),
                                            readonly: !0
                                        }, te(t), isPolylineClosed(r)) {
                                        var m = Rt(r);
                                        t = {
                                            type: "input_text",
                                            prop_name: "\u041F\u043B\u043E\u0449\u0430\u0434\u044C",
                                            value: ut(m.toFixed(2)),
                                            readonly: !0
                                        }, te(t)
                                    }
                                    if (y_("is_show_line_start_end_type_in_obj_tbl")) {
                                        var h = Zo.modal_linestartend.values[Zi.attrs.pline_start].title;
                                        "" != Zi.attrs.pline_start_val && (h += " (" + Zi.attrs.pline_start_val + ")"), t = {
                                            type: "modal",
                                            prop_name: "\u041D\u0430\u0447\u0430\u043B\u043E \u043B\u0438\u043D\u0438\u0438",
                                            html: "<span id=\"obj_tbl_pline_start\" class=\"obj_tbl_modal_span\">" + h + "</span>",
                                            functions: [{
                                                type: "onclick",
                                                name: "SimpleCad.Action",
                                                param: "{'type':'ModalShow', 'target':'pline_start'}"
                                            }],
                                            prop_row_class: "d_prop_pline_start"
                                        }, te(t), h = Zo.modal_linestartend.values[Zi.attrs.pline_end].title, "" != Zi.attrs.pline_end_val && (h += " (" + Zi.attrs.pline_end_val + ")"), t = {
                                            type: "modal",
                                            prop_name: "\u041A\u043E\u043D\u0435\u0446 \u043B\u0438\u043D\u0438\u0438",
                                            html: "<span id=\"obj_tbl_pline_end\" class=\"obj_tbl_modal_span\">" + h + "</span>",
                                            functions: [{
                                                type: "onclick",
                                                name: "SimpleCad.Action",
                                                param: "{'type':'ModalShow', 'target':'pline_end'}"
                                            }],
                                            prop_row_class: "d_prop_pline_end"
                                        }, te(t)
                                    }
                                    break;
                                default:
                            }
                            break;
                        case "lineblock":
                            var u = Zo.modal_lineblock_type.values[Zi.attrs.type].set_lineblock_length_readonly;
                            t = {
                                type: "input_text",
                                prop_name: "\u0414\u043B\u0438\u043D\u0430",
                                value: Zi.attrs.lb_length,
                                placeholder: "\u0414\u043B\u0438\u043D\u0430",
                                readonly: u,
                                functions: [{
                                    type: "oninput",
                                    name: "SimpleCad.Action",
                                    param: "{'type':'ObjectTablePropsInputChange','thisObject':$(this)}"
                                }, {
                                    type: "onkeyup",
                                    name: "SimpleCad.Action",
                                    param: "{'type':'ObjectTablePropsInputChangeKeyup','eventObject':event,'thisObject':$(this)}"
                                }],
                                data_params: [{
                                    name: "id",
                                    param: "line_block_properties_length"
                                }, {
                                    name: "data-change-element-param",
                                    param: "lb_length"
                                }, {
                                    name: "data-validate-type",
                                    param: "numeric"
                                }, {
                                    name: "data-focus",
                                    param: e
                                }]
                            }, te(t), e++, t = {
                                type: "input_text",
                                prop_name: "\u041E\u0442\u0441\u0442\u0443\u043F",
                                value: Zi.attrs.lb_offset,
                                placeholder: "\u041E\u0442\u0441\u0442\u0443\u043F",
                                functions: [{
                                    type: "oninput",
                                    name: "SimpleCad.Action",
                                    param: "{'type':'ObjectTablePropsInputChange','thisObject':$(this)}"
                                }, {
                                    type: "onkeyup",
                                    name: "SimpleCad.Action",
                                    param: "{'type':'ObjectTablePropsInputChangeKeyup','eventObject':event,'thisObject':$(this)}"
                                }],
                                data_params: [{
                                    name: "data-change-element-param",
                                    param: "lb_offset"
                                }, {
                                    name: "data-validate-type",
                                    param: "numeric"
                                }, {
                                    name: "data-focus",
                                    param: e
                                }]
                            }, te(t), e++;
                            var h = Zo.modal_lineblock_type.values[Zi.attrs.type].title;
                            t = {
                                type: "modal",
                                prop_name: "\u0422\u0438\u043F",
                                html: "<span id=\"obj_tbl_lineblock\" class=\"obj_tbl_modal_span\">" + h + "</span>",
                                functions: [{
                                    type: "onclick",
                                    name: "SimpleCad.Action",
                                    param: "{'type':'ModalShow', 'target':'lineblock_type'}"
                                }]
                            }, te(t), e++;
                            break;
                        default:
                    }
                }
                break;
            case "Text":
                t = {
                    type: "textarea",
                    prop_name: "\u0422\u0435\u043A\u0441\u0442",
                    text_value: Zi.attrs.text,
                    text_rows: 5,
                    placeholder: "\u0422\u0435\u043A\u0441\u0442",
                    functions: [{
                        type: "oninput",
                        name: "SimpleCad.Action",
                        param: "{'type':'ObjectTablePropsInputChange','thisObject':$(this)}"
                    }, {
                        type: "onkeyup",
                        name: "SimpleCad.Action",
                        param: "{'type':'ObjectTablePropsInputChangeKeyup','eventObject':event,'thisObject':$(this)}"
                    }],
                    data_params: [{
                        name: "data-change-element-param",
                        param: "text"
                    }, {
                        name: "data-focus",
                        param: e
                    }]
                }, te(t), e++;
                break;
            default:
        }
    }

    function X(e, t) {
        switch (e) {
            case "releasenotes_one":
                $("#proektor_z_modal_title").html("\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F"), $("#proektor_z_modal_content").html(Jo), K(e, t);
                break;
            default:
        }
        $("#proektor_z_modal").show()
    }

    function G(e) {
        vl.removeClass("modal-yes-no"), vl.removeClass("modals_right_top"), vl.removeClass("modal-lg"), vl.removeClass("modal-full-width"), $.each(e, function(e, t) {
            vl.addClass(t)
        })
    }

    /**
     * Отображает модальное окно в зависимости от указанного типа.
     * Настраивает содержимое, заголовок и кнопки для различных типов модальных окон.
     * 
     * @param {string} e - Тип модального окна для отображения
     * @param {Object} t - Параметры модального окна, зависящие от типа
     * @returns {void}
     */
    function showModalWindow(e, t) {
        // Устанавливаем текущий тип модального окна и скрываем все существующие модальные окна
        Bo = e;
        $(".modals").hide();
        
        switch (Bo) {
            case "roof_crossing_remove_error_no_element":
                // Ошибка удаления лишнего перекрытия листов
                G(["modal-lg"]);
                $("#modal_info_contents").html("<ul class=\"gl_form_err_ul\"><li><i class=\"fa fa-exclamation-triangle\"></i> \u041D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u044D\u043B\u0435\u043C\u0435\u043D\u0442 \u0441 \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u043E\u0439.</li></ul>");
                $("#modal_info_h").html("\u041E\u0448\u0438\u0431\u043A\u0430 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F \u043B\u0438\u0448\u043D\u0435\u0433\u043E \u043F\u0435\u0440\u0435\u043A\u0440\u044B\u0442\u0438\u044F \u043B\u0438\u0441\u0442\u043E\u0432");
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                vl.show();
                break;
                
            case "calc_trigonom":
                // Тригонометрический калькулятор
                G(["modal-lg"]);
                $("#modal_info_contents").html(Jo);
                $("#modal_info_h").html("\u0422\u0440\u0438\u0433\u043E\u043D\u043E\u043C\u0435\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440");
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                K(Bo, {});
                vl.show();
                break;
                
            case "roof_accessories_mch_pn":
                // Комплектующие - металлочерепица, профнастил
                G(["modal-full-width"]);
                $("#modal_info_contents").html(Jo);
                $("#modal_info_h").html("\u041A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u0443\u044E\u0449\u0438\u0435 - \u043C\u0435\u0442\u0430\u043B\u043B\u043E\u0447\u0435\u0440\u0435\u043F\u0438\u0446\u0430, \u043F\u0440\u043E\u0444\u043D\u0430\u0441\u0442\u0438\u043B");
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                K(Bo, {});
                vl.show();
                break;
                
            case "roof_accessories_falc":
                // Комплектующие - фальц
                G(["modal-full-width"]);
                $("#modal_info_contents").html(Jo);
                $("#modal_info_h").html("\u041A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u0443\u044E\u0449\u0438\u0435 - \u0444\u0430\u043B\u044C\u0446");
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                K(Bo, {});
                vl.show();
                break;
                
            case "roofstat_error_cuts_exist_points_out_polygon":
                // Ошибка: вырезы не полностью внутри фигуры ската
                G(["modal-lg"]);
                $("#modal_info_h").html("\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u0438");
                var _ = "<p>\u041E\u0448\u0438\u0431\u043A\u0430: \u0435\u0441\u0442\u044C \u0432\u044B\u0440\u0435\u0437\u044B, \u0443 \u043A\u043E\u0442\u043E\u0440\u044B\u0445 \u043D\u0435 \u0432\u0441\u0435 \u0442\u043E\u0447\u043A\u0438 \u043D\u0430\u0445\u043E\u0434\u044F\u0442\u0441\u044F \u0432\u043D\u0443\u0442\u0440\u0438 \u0444\u0438\u0433\u0443\u0440\u044B \u0441\u043A\u0430\u0442\u0430. \u041F\u0440\u0438 \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u0435 \u043B\u0438\u0441\u0442\u043E\u0432 \u0442\u0430\u043A\u0438\u0435 \u0432\u044B\u0440\u0435\u0437\u044B \u0443\u0447\u0442\u0435\u043D\u044B, \u043D\u043E \u043F\u0440\u0438 \u0440\u0430\u0441\u0447\u0451\u0442\u0435 \u043F\u043B\u043E\u0449\u0430\u0434\u0438 \u0441\u043A\u0430\u0442\u0430 \u043E\u043D\u0438 \u043D\u0435 \u0443\u0447\u0438\u0442\u044B\u0432\u0430\u044E\u0442\u0441\u044F (\u0438\u0445 \u043F\u043B\u043E\u0449\u0430\u0434\u044C \u043D\u0435 \u0432\u044B\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u0438\u0437 \u043F\u043B\u043E\u0449\u0430\u0434\u0438 \u0441\u043A\u0430\u0442\u0430).</p><p><img src=\"" + Ys + "info/roofstat_scale_without_cuts.png\" class=\"img-responsive center-block\"></p>";
                $("#modal_info_contents").html(_);
                vl.show();
                break;
                
            case "modal_img":
                // Модальное окно с изображением
                G(["modal-full-width"]);
                $("#modal_info_h").html("&nbsp;");
                var _ = "<img src=\"" + t.target + "\" class=\"img-responsive center-block\">";
                $("#modal_info_contents").html(_);
                vl.show();
                break;
                
            case "pline_segment_highlight_set_length":
                // Смена длины стороны полилинии
                G(["modal-yes-no", "modals_right_top"]);
                $("#modal_info_h").html("\u0421\u043C\u0435\u043D\u0430 \u0434\u043B\u0438\u043D\u044B \u0441\u0442\u043E\u0440\u043E\u043D\u044B");
                var a = {
                    form_id: "pline_segment_highlight_set_length_form",
                    pline_segment_highlight_set_length_length_val: hi.segment_length
                };
                $("#modal_info_contents").html(Yr(a));
                var r = {
                    footer_id: "pline_segment_highlight_set_length_footer"
                };
                $("#modal_info_footer").html(Dr(r));
                vl.show();
                break;
                
            case "roof_menu_edit_sheet_rename":
                // Переименование вкладки, если кнопка не деактивирована
                if (!$("#nav_li_edit_tab_rename").hasClass("disabled")) {
                    G(["modal-yes-no"]);
                    $("#modal_info_h").html("\u041F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u0442\u044C \u0432\u043A\u043B\u0430\u0434\u043A\u0443");
                    var a = {
                        form_id: "roof_menu_edit_sheet_rename_form",
                        roof_menu_edit_sheet_rename_name_val: rl.find("[data-layer-num=\"" + yo + "\"]").html()
                    };
                    $("#modal_info_contents").html(Yr(a));
                    var r = {
                        footer_id: "roof_menu_edit_sheet_rename_footer"
                    };
                    $("#modal_info_footer").html(Dr(r));
                    vl.show();
                } else {
                    return;
                }
                break;
                
            case "roof_specification_full_project":
                // Спецификация проекта
                G(["modal-full-width"]);
                $("#modal_info_h").html("\u0421\u043F\u0435\u0446\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F");
                $("#modal_info_contents").html(Jo);
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                vl.show();
                break;
                
            case "pline_start":
                // Настройка начала линии
                G([""]);
                $("#modal_linestartend_h").html("\u041D\u0430\u0447\u0430\u043B\u043E \u043B\u0438\u043D\u0438\u0438");
                $("#modal_linestartend").find("input[type=\"radio\"]").prop("checked", false);
                var n = Zi.attrs.pline_start;
                $("#linestartend__" + n).prop("checked", true);
                $("#linestartend__" + n + "_val").val(Zi.attrs.pline_start_val);
                $("#modal_linestartend").show();
                break;
                
            case "pline_end":
                // Настройка конца линии
                G([""]);
                $("#modal_linestartend_h").html("\u041A\u043E\u043D\u0435\u0446 \u043B\u0438\u043D\u0438\u0438");
                $("#modal_linestartend").find("input[type=\"radio\"]").prop("checked", false);
                var n = Zi.attrs.pline_end;
                $("#linestartend__" + n).prop("checked", true);
                $("#linestartend__" + n + "_val").val(Zi.attrs.pline_end_val);
                $("#modal_linestartend").show();
                break;
                
            case "save":
                // Модальное окно сохранения
                $("#modal_save").show();
                break;
                
            case "lineblock":
                // Модальное окно блока линий
                G([""]);
                $("#modal_lineblock_form").html(Jo);
                K(Bo, {});
                $("#modal_lineblock").show();
                break;
                
            case "lineblock_type":
                // Тип блока линий
                G([""]);
                $("#modal_lineblock_type").find("select").val(Zi.attrs.type);
                $("#modal_lineblock_type").show();
                break;
                
            case "roof_has_errors":
                // Ошибки при расчёте кровли
                G([""]);
                $("#modal_info_contents").html(Jo);
                $("#modal_info_h").html("\u0420\u0430\u0441\u0447\u0451\u0442 \u043A\u0440\u043E\u0432\u043B\u0438");
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                vl.show();
                break;
                
            case "figure":
                // Вставка фигуры
                G(["modal-lg"]);
                $("#modal_info_contents").html(Jo);
                $("#modal_info_h").html("\u0412\u0441\u0442\u0430\u0432\u043A\u0430 \u0444\u0438\u0433\u0443\u0440\u044B");
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                K(Bo, {
                    relative_from_mode: Eo
                });
                vl.show();
                break;
                
            case "figure_nde":
                // Шаблоны доборных элементов
                G(["modal-full-width"]);
                $("#modal_info_contents").html(Jo);
                $("#modal_info_h").html("\u0428\u0430\u0431\u043B\u043E\u043D\u044B \u0434\u043E\u0431\u043E\u0440\u043D\u044B\u0445 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432");
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                K(Bo, {});
                vl.show();
                break;
                
            case "trash_btn_click_error":
                // Ошибка удаления объекта
                G(["modal-lg"]);
                $("#modal_info_contents").html("<ul class=\"gl_form_err_ul\"><li><i class=\"fa fa-exclamation-triangle\"></i> \u0414\u043B\u044F \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043E\u0431\u044A\u0435\u043A\u0442 \u0432 \u0441\u043F\u0438\u0441\u043A\u0435 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432 \u0447\u0435\u0440\u0442\u0435\u0436\u0430.</li></ul><img src=\"" + Is + "data/interface/trash_error_info.png\" class=\"center-block\">");
                $("#modal_info_h").html("\u041E\u0448\u0438\u0431\u043A\u0430 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F");
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                vl.show();
                break;
                
            case "mirror_btn_click_error":
                // Ошибка отражения элемента
                G(["modal-lg"]);
                $("#modal_info_contents").html("<ul class=\"gl_form_err_ul\"><li><i class=\"fa fa-exclamation-triangle\"></i> \u0414\u043B\u044F \u043E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043E\u0431\u044A\u0435\u043A\u0442 \u0432 \u0441\u043F\u0438\u0441\u043A\u0435 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432 \u0447\u0435\u0440\u0442\u0435\u0436\u0430.</li></ul><img src=\"" + Is + "data/interface/trash_error_info.png\" class=\"center-block\">");
                $("#modal_info_h").html("\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430");
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                vl.show();
                break;
                
            case "mirror_tab_btn_click_error":
                // Ошибка отражения вкладки
                G(["modal-lg"]);
                $("#modal_info_contents").html("<ul class=\"gl_form_err_ul\"><li><i class=\"fa fa-exclamation-triangle\"></i> \u041D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432 \u0432\u043A\u043B\u0430\u0434\u043A\u0438 \u0434\u043B\u044F \u043E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u044F.</li></ul>");
                $("#modal_info_h").html("\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0432\u043A\u043B\u0430\u0434\u043A\u0438");
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                vl.show();
                break;
                
            case "rotate_btn_click_error":
                // Ошибка вращения элемента
                G(["modal-lg"]);
                $("#modal_info_contents").html("<ul class=\"gl_form_err_ul\"><li><i class=\"fa fa-exclamation-triangle\"></i> \u0414\u043B\u044F \u0432\u0440\u0430\u0449\u0435\u043D\u0438\u044F \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043E\u0431\u044A\u0435\u043A\u0442 \u0432 \u0441\u043F\u0438\u0441\u043A\u0435 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432 \u0447\u0435\u0440\u0442\u0435\u0436\u0430.</li></ul><img src=\"" + Is + "data/interface/trash_error_info.png\" class=\"center-block\">");
                $("#modal_info_h").html("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u0440\u0430\u0449\u0435\u043D\u0438\u044F \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430");
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                vl.show();
                break;
                
            case "roof_new":
                // Новый расчёт кровли
                G(["modal-lg"]);
                Ho = {};
                $("#modal_info_contents").html(Jo);
                $("#modal_info_h").html("\u041D\u043E\u0432\u044B\u0439 \u0440\u0430\u0441\u0447\u0451\u0442 \u043A\u0440\u043E\u0432\u043B\u0438");
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                K(Bo, {});
                vl.show();
                break;
                
            case "roof_save_as_modal":
                // Сохранить проект как, если кнопка не деактивирована
                if (!$("#nav_li_file_save_as").hasClass("disabled")) {
                    G(["modal-lg"]);
                    $("#modal_info_contents").html(Jo);
                    $("#modal_info_h").html("\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043A\u0430\u043A");
                    $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                    K(Bo, {});
                    vl.show();
                } else {
                    return;
                }
                break;
                
            case "roof_settings":
                // Настройки параметров расчёта кровли, если кнопка не деактивирована
                if (!$("#nav_li_file_settings").hasClass("disabled")) {
                    G(["modal-lg"]);
                    Ho = {};
                    $("#modal_info_contents").html(Jo);
                    $("#modal_info_h").html("\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0440\u0430\u0441\u0447\u0451\u0442\u0430 \u043A\u0440\u043E\u0432\u043B\u0438");
                    $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                    K(Bo, {
                        roof_data_params: Mo
                    });
                    vl.show();
                } else {
                    return;
                }
                break;
                
            case "roof_settings_programm":
                // Настройки программы
                G(["modal-full-width"]);
                $("#modal_info_contents").html(Jo);
                $("#modal_info_h").html("\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B");
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                K(Bo, {});
                vl.show();
                break;
                
            case "roof_open_modal":
                // Открыть расчёт
                G(["modal-full-width"]);
                $("#modal_info_contents").html(Jo);
                $("#modal_info_h").html("\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0440\u0430\u0441\u0447\u0451\u0442");
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                K(Bo, {});
                vl.show();
                break;
                
            case "yes_no_roof_menu_edit_sheet_remove":
                // Подтверждение удаления вкладки, если кнопка не деактивирована
                if (!$("#nav_li_edit_tab_remove").hasClass("disabled")) {
                    var s = rl.find(".active").html();
                    G(["modal-full-width", "modal-yes-no"]);
                    $("#modal_info_h").html("\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u043A\u043B\u0430\u0434\u043A\u0443");
                    $("#modal_info_contents").html("<ul class=\"gl_form_err_ul\"><li><i class=\"fa fa-exclamation-triangle\"></i> \u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u043A\u043B\u0430\u0434\u043A\u0443 \"" + s + "\" ?</li></ul>");
                    $("#modal_info_footer").html("<div class=\"row\"><div class=\"col-xs-12 text-center\" ><button type=\"button\" class=\"btn btn-danger mr10\" onclick=\"SimpleCad.Action({'type':'roof_menu_edit_sheet_remove'});\">\u0423\u0434\u0430\u043B\u0438\u0442\u044C</button><button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default ml10\">\u041E\u0442\u043C\u0435\u043D\u0430</button></div></div>");
                    vl.show();
                } else {
                    return;
                }
                break;
                
            case "admin_nomenclature_group":
                // Настройка номенклатурных групп
                G(["modal-full-width"]);
                $("#modal_info_h").html("\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u043D\u043E\u043C\u0435\u043D\u043A\u043B\u0430\u0442\u0443\u0440\u043D\u044B\u0445 \u0433\u0440\u0443\u043F\u043F");
                $("#modal_info_contents").html(Jo);
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                K(Bo, {});
                vl.show();
                break;
                
            case "nde_validate_errors":
                // Проверка доборного элемента - ошибки
                G([""]);
                $("#modal_info_h").html("\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0434\u043E\u0431\u043E\u0440\u043D\u043E\u0433\u043E \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430");
                $("#modal_info_contents").html(t.errors_html);
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                vl.show();
                break;
                
            case "nde_validate_description":
                // Требования к доборным элементам
                G(["modal-lg"]);
                $("#modal_info_h").html("\u0422\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F \u043A \u0434\u043E\u0431\u043E\u0440\u043D\u044B\u043C \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u043C");
                $("#modal_info_contents").html(Jo);
                $("#modal_info_footer").html("<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>");
                K(Bo, {});
                vl.show();
                break;
                
            default:
                // Если тип модального окна не определён, ничего не делаем
        }
        
        // Отображаем модальное окно
        $("#modal_html").modal("show");
    }

    function K(e, t) {
        var _ = {
                type: e,
                data: {},
                g_start_data: ei,
                g_project_file: ti,
                current_layer_name: vo,
                token_data: zl.val(),
                js_ver: "26022025"
            },
            a = {},
            r = "";
        switch (e) {
            case "form":
                switch (r = t.form_id, a = $("#" + r).serializeArray(), a = Nt(a), _.form_id = r, _.form_inputs = a, r) {
                    case "roof_new_form":
                        _.roof_data_params = Mo;
                        break;
                    case "roof_save_as_form":
                        _.data = "";
                        break;
                    default:
                }
                break;
            case "roof_specification_full_project_demand":
                if (_.data = {
                        mode: si,
                        specification: ni.sheets_filtered_sorted_grouped,
                        branch_id_1c: Mo.branch_id_1c,
                        pdf_attach_file_name: ni.pdf_attach_file_name,
                        png_attach_files_name: ni.png_attach_files_name,
                        employee_id_1c: $("#roof_specification_full_project_employee_selected_id_1c").val()
                    }, "[]" != Mo.sheet_allowed_length_edit && (-1 !== $.inArray(Mo.type, ["siding", "siding_vert"]) || "mch" == Mo.type && "warehouse_cutted_schemed" == Mo.mch_edited_shal_calc_mode)) {
                    var n = [];
                    $.each(Di.sizes, function(e, t) {
                        n.push({
                            size: (t.size / 1e3).toFixed(2),
                            amount: t.count.toFixed(0),
                            quantity: (t.size * t.count * Mo.sheet_width / 1e6).toFixed(2),
                            id_1c: Mo.nom_id_1c,
                            code_1c: Mo.nom_code_1c
                        })
                    }), _.data.specification = JSON.copy(n)
                }
                break;
            case "objectaddlayerrow":
            case "save":
                _.data.params = t;
                break;
            case "roof_calc":
                _.data = t, $("#nav_roof_calc_process_btn").addClass("active"), Us = !1;
                break;
            case "roof_save":
            case "roof_load":
                _.data = t;
                break;
            case "lineblock":
                if (incrementElementCounter(e), _.data.glob_elem_name_counter = wo[e], _.data.elements = Ct({
                        filter_type: ["line", "pline"],
                        filter_visible: "1"
                    }), "glzabor" == ei.type) {
                    var s = $("#d_elements_accordion").find("[data-element=\"lineblock\"]").attr("data_raschet_ogragdeniy_lineblock_type_mode");
                    _.data.data_raschet_ogragdeniy_lineblock_type_mode = "undefined" == typeof s ? "selectprod_stand16" : s
                }
                break;
            default:
                _.data = t;
        }
        // $.ajax({
        //     url: Ds,
        //     type: "post",
        //     data: _,
        //     dataType: "json",
        //     success: function(_) {
        //         if ("" != _.set_form_id && (r = _.set_form_id), 0 < _.errors.length) {
        //             var s = "";
        //             $.each(_.errors, function(e, t) {
        //                 s += "<li>" + t + "</li>"
        //             }), $("#" + r).find(".gl_form_err_ul").append(s)
        //         }
        //         if (0 < _.error_ids.length && $.each(_.error_ids, function(e, t) {
        //                 $("#" + r).find("#" + t).parent().addClass("f-has-error")
        //             }), "" != _.success_js_action) switch (_.success_js_action) {
        //             case "LineBlockValidatedSuccess":
        //                 SimpleCad.Action({
        //                     type: "LineBlockValidatedSuccess",
        //                     form_inputs: a,
        //                     response_data: _.data
        //                 });
        //                 break;
        //             case "roof_new_form_success":
        //                 "success" == _.data.status && ($("#roof_new_find_nomenclature_btn").hide(), $("#roof_new_form_create_btn").show(), $("#roof_new_form_set_settings").show(), "undefined" == typeof _.data.roof_data_params_preloaded ? (alert("\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u043E\u0432"), Ho = {}) : Ho = JSON.parse(JSON.stringify(_.data.roof_data_params_preloaded)));
        //                 break;
        //             case "roof_save_as_form_success":
        //                 "undefined" != typeof _.data.g_project_file_set_id && "undefined" != typeof _.data.g_project_file_set_name ? (ti.id = _.data.g_project_file_set_id, ti.name = _.data.g_project_file_set_name, $("#modal_html").modal("hide"), Gn(), SimpleCad.Action({
        //                     type: "roof_save"
        //                 })) : alert("\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043F\u0438\u0441\u0438 \u043F\u0440\u0438 \u0432\u044B\u0437\u043E\u0432");
        //                 break;
        //             case "roof_remove_roof_files_list_update":
        //                 Ro = -1, la();
        //                 break;
        //             case "nde_check_and_attach_crop_success":
        //                 ws(_.data);
        //                 break;
        //             case "nde_as_modal_cropped_image_success":
        //                 Cs(_.data);
        //                 break;
        //             default:
        //         }
        //         switch (e) {
        //             case "form":
        //                 Dt(r);
        //                 break;
        //             case "roof_calc":
        //                 0 < _.errors.length ? showModalWindow("roof_has_errors", {}) : Y_(_);
        //                 break;
        //             case "roof_save":
        //                 "undefined" != typeof _.data.g_project_file_set_id && (ti.id = _.data.g_project_file_set_id), la();
        //                 var o = ti.name.replace("[[", "").replace("]]", "");
        //                 $("#r_d_nav_bot_file").html("<b>id:</b> " + ti.id + "&nbsp;&nbsp; <b>\u0424\u0430\u0439\u043B:</b> " + o), t.is_restart_autosave && qn();
        //                 break;
        //             case "roof_menu_edit_sheet_paste":
        //                 "undefined" != typeof _.data.sheet_tab && ("undefined" == typeof _.data.cad_elements && (_.data.cad_elements = []), "undefined" == typeof _.data.tabs_axis_point_paste_tab_set && (_.data.tabs_axis_point_paste_tab_set = {}), Fn(_.data.sheet_tab, _.data.cad_elements, -1, e, _.data.tabs_axis_point_paste_tab_set));
        //                 break;
        //             case "roof_load":
        //                 I_(_);
        //                 break;
        //             case "user_settings_load":
        //                 "undefined" == typeof _.data.user_settings ? alert("\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u043E\u0432 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F.") : ("undefined" != typeof _.data.user_settings.settings_programm_sheet_tabs && "undefined" != typeof _.data.user_settings.settings_programm_sheet_tabs.name_mode && (Wo.settings_programm_sheet_tabs.name_mode = parseInt(_.data.user_settings.settings_programm_sheet_tabs.name_mode), Oa()), "undefined" != typeof _.data.user_settings.settings_programm_autosave && "undefined" != typeof _.data.user_settings.settings_programm_autosave.is_use_autosave && "undefined" != typeof _.data.user_settings.settings_programm_autosave.autosave_interval && (Wo.settings_programm_autosave.is_use_autosave = parseInt(_.data.user_settings.settings_programm_autosave.is_use_autosave), Wo.settings_programm_autosave.autosave_interval = Math.ceil(_.data.user_settings.settings_programm_autosave.autosave_interval)));
        //                 break;
        //             default:
        //         }
        //         switch (0 < _.hide_html.length && $.each(_.hide_html, function(e, t) {
        //                 $("#" + t.id).hide()
        //             }), 0 < _.update_html.length && $.each(_.update_html, function(e, t) {
        //                 $("#" + t.id).html(t.html)
        //             }), 0 < _.update_value.length && $.each(_.update_value, function(e, t) {
        //                 $("#" + t.id).val(t.val)
        //             }), 0 < _.set_attr.length && $.each(_.set_attr, function(e, t) {
        //                 if ("undefined" != typeof t.type) switch (t.type) {
        //                     case "data-param":
        //                         $("[" + t["data-param"] + "=\"" + t["data-param-value"] + "\"]").attr(t.attr_name, t.attr_value);
        //                         break;
        //                     default:
        //                 }
        //             }), 0 < _.remove_html.length && $.each(_.remove_html, function(e, t) {
        //                 if ("undefined" != typeof t.type) switch (t.type) {
        //                     case "data-param":
        //                         $("[" + t["data-param"] + "=\"" + t["data-param-value"] + "\"]").remove();
        //                         break;
        //                     default:
        //                 }
        //             }), 0 < _.notifications.length && $.each(_.notifications, function(e, t) {
        //                 Pn(t)
        //             }), 0 < _.append_html.length && $.each(_.append_html, function(e, t) {
        //                 $("#" + t.id).append(t.html)
        //             }), "" != _.location_blank && window.open(_.location_blank, "_blank"), e) {
        //             case "calc_trigonom":
        //                 SimpleCad.Action({
        //                     type: "calc_trigonom_modal_success"
        //                 });
        //                 break;
        //             case "form":
        //                 switch (r) {
        //                     case "form_settings_programm_sheet_tabs":
        //                         "undefined" != typeof _.data.user_settings && "undefined" != typeof _.data.user_settings.settings_programm_sheet_tabs && "undefined" != typeof _.data.user_settings.settings_programm_sheet_tabs.name_mode && (Wo.settings_programm_sheet_tabs.name_mode = parseInt(_.data.user_settings.settings_programm_sheet_tabs.name_mode));
        //                         break;
        //                     case "form_settings_programm_autosave":
        //                         "undefined" != typeof _.data.user_settings && "undefined" != typeof _.data.user_settings.settings_programm_autosave && "undefined" != typeof _.data.user_settings.settings_programm_autosave.is_use_autosave && "undefined" != typeof _.data.user_settings.settings_programm_autosave.autosave_interval && (Wo.settings_programm_autosave.is_use_autosave = parseInt(_.data.user_settings.settings_programm_autosave.is_use_autosave), Wo.settings_programm_autosave.autosave_interval = Math.ceil(_.data.user_settings.settings_programm_autosave.autosave_interval), qn());
        //                         break;
        //                     default:
        //                 }
        //                 break;
        //             case "objectaddlayerrow":
        //                 se(), k_();
        //                 break;
        //             case "lineblock":
        //                 $("#id_lb_first").trigger("click");
        //                 break;
        //             case "roof_specification_full_project":
        //                 Ir(), ni.roof_data_full = S_("roof_specification_full_project_table"), Tr(), Di = {
        //                     positions: [],
        //                     sizes: []
        //                 }, ar("modal_show"), Sr();
        //                 break;
        //             case "roof_specification_full_project_pdf":
        //             case "roof_specification_full_project_pdf_and_demand":
        //                 $("#roof_specification_full_project_pdf_btn").find(".table_cad_span_link_loading").hide(), ni.pdf_attach_file_name = _.data.specification_pdf_attach_file_name, ni.png_attach_files_name = _.data.specification_pdf_attach_file_name_png, "roof_specification_full_project_pdf_and_demand" == e && K("roof_specification_full_project_demand", {});
        //                 break;
        //             case "roof_calc":
        //                 $("#nav_roof_calc_process_btn").removeClass("active"), Us = !0;
        //                 break;
        //             case "figure":
        //                 "undefined" != typeof _.data.user_settings && "undefined" != typeof _.data.user_settings.settings_programm_figures_razmer && "undefined" != typeof _.data.user_settings.settings_programm_figures_razmer.is_use_razmer_template && "undefined" != typeof _.data.user_settings.settings_programm_figures_razmer.razmer_template && (Wo.settings_programm_figures_razmer.is_use_razmer_template = parseInt(_.data.user_settings.settings_programm_figures_razmer.is_use_razmer_template), Wo.settings_programm_figures_razmer.razmer_template = _.data.user_settings.settings_programm_figures_razmer.razmer_template);
        //                 break;
        //             case "figure_nde":
        //                 var n = $("#r_d_root").height() - 225;
        //                 $("#figures_nde_doborn_left").css("height", n + "px"), $("#figures_nde_doborn_right").css("height", n + "px");
        //                 break;
        //             case "nde_nom_fields":
        //                 mo = _.data;
        //                 break;
        //             case "roof_accessories_mch_pn":
        //                 cn({
        //                     mode: "modal_loaded_success"
        //                 });
        //                 break;
        //             default:
        //         }
        //     },
        //     error: function(_, a, n) {
        //         switch (console.log(_), console.log(a), console.log(n), e) {
        //             case "form":
        //                 Dt(r);
        //                 break;
        //             case "roof_calc":
        //                 $("#nav_roof_calc_process_btn").removeClass("active"), Us = !0;
        //                 break;
        //             default:
        //         }
        //         N("backent_ajax_error_main", {
        //             textStatus: a,
        //             errorThrown: n,
        //             ish_type: e,
        //             ish_params: t
        //         })
        //     }
        // })
    }

    function N(e, t) {
        var _ = {
            type: e,
            data: t,
            g_start_data: ei,
            g_project_file: ti,
            current_layer_name: vo,
            js_ver: "26022025"
        };
        // $.ajax({
        //     url: Ds,
        //     type: "post",
        //     data: _,
        //     dataType: "json",
        //     success: function() {},
        //     error: function() {}
        // })
    }

    function V() {
        switch (Bo) {
            case "pline_start":
                E("pline_start");
                break;
            case "pline_end":
                E("pline_end");
                break;
            case "lineblock_type":
                M();
                break;
            default:
        }
        $("#modal_html").modal("hide")
    }

    function E(e) {
        var t = $("#modal_linestartend").find("input[type=\"radio\"]:checked").val(),
            _ = $("#linestartend__" + t + "_val").val();
        Zi.attrs[e] = t, Zi.attrs[e + "_val"] = _;
        var a = Zo.modal_linestartend.values[t].title;
        "" != Zi.attrs[e + "_val"] && (a += " (" + Zi.attrs[e + "_val"] + ")"), $("#obj_tbl_" + e).html(a), He(Zi), to[vo].draw()
    }

    function M() {
        var e = $("#modal_lineblock_type_select").val();
        Zi.attrs.type = e;
        var t = Zo.modal_lineblock_type.values[e].title;
        $("#obj_tbl_lineblock").html(t);
        var _ = Zo.modal_lineblock_type.values[e].set_lineblock_length_on_change,
            a = Zo.modal_lineblock_type.values[e].set_lineblock_length_readonly;
        $("#line_block_properties_length").val(_).prop("readonly", a);
        var r = $("#line_block_properties_length").parent().find("input");
        J(r)
    }

    function R(e) {
        e.parent().parent().find(".d_prop_subm").hasClass("active") || (e.parent().parent().find(".d_prop_subm").addClass("active"), $("#add_object_table input").prop("disabled", !0), e.prop("disabled", !1), e.focus())
    }

    function H() {
        oe(), D()
    }

    function B(e) {
        var t = e.parent().parent().find(".form-control");
        J(t)
    }

    function Z(e, t) {
        var _ = e.keyCode,
            a = e.ctrlKey,
            r = "";
        switch ("undefined" != typeof t[0].localName && (r = t[0].localName), _) {
            case 13:
                ("input" == r || "textarea" == r && a) && J(t);
                break;
            case 27:
                H();
                break;
            default:
        }
    }

    function J(e) {
        var t = Q(e);
        if (t.is_success && (ee(e), oe(), D(), "undefined" != typeof e[0].attributes["data-focus"])) {
            var _ = e[0].attributes["data-focus"].value;
            _ = parseInt(_), _++, $("#add_object_table").find("[data-focus=\"" + _ + "\"]").focus()
        }
    }

    function Q(e) {
        var t = {
                is_success: !0
            },
            _ = e[0].value;
        if ("" == _ && (t.is_success = !1), t.is_success && "undefined" != typeof e[0].attributes["data-validate-type"]) {
            var a = e[0].attributes["data-validate-type"].value;
            switch (a) {
                case "numeric":
                    _ = U(_), isNaN(_) && (t.is_success = !1);
                    break;
                default:
            }
        }
        return t.is_success || e.addClass("f-has-error"), t
    }

    function U(e) {
        return e += "", e = e.replace(",", "."), e = parseFloat(e), isNaN(e) && (e = 0), e
    }

    function ee(e) {
        if ("undefined" != typeof e[0].attributes["data-change-element-param"]) {
            var t = !0,
                _ = !0,
                a = !0,
                r = !0,
                n = e[0].attributes["data-change-element-param"].value,
                s = e[0].value,
                o = Zi.id();
            if ("undefined" != typeof e[0].attributes["data-param"]) var i = e[0].attributes["data-param"].value;
            switch (n) {
                case "name":
                    Zi.name(s), al.find("[data-obj-id=\"" + o + "\"]").html(s), t = !1, _ = !1, a = !1, r = !1;
                    break;
                case "text":
                    Zi.text(s), t = !0, _ = !1, a = !1, r = !1;
                    break;
                case "points":
                    i = parseInt(i), s = U(s), s = s * Go.g_scale[vo] / 100, i % 2 ? (s *= -1, s += Ao[vo]) : s += Fo[vo];
                    var l = Zi.points();
                    l[i] = s, Zi.setPoints(l), t = !0, _ = !0, a = !0;
                    break;
                case "line_length":
                    break;
                case "lines_angle":
                    break;
                case "lb_length":
                case "lb_offset":
                    s = U(s), Zi.attrs[n] = s, St(Zi.id()), processElementById(Zi.attrs.parent_id);
                    var c = Bi.findOne("#" + Zi.attrs.parent_id);
                    He(c), t = !0, _ = !1, a = !1;
                    break;
                default:
            }
            a && Tt(Zi.id()), _ && (processAndClearElement(Zi), He(Zi), vt(Zi, !1), "undefined" != typeof Zi && "undefined" !== Zi && le()), t && to[vo].draw(), r && k_()
        }
    }

    function te(e) {
        var t = "",
            _ = "",
            a = "",
            r = "",
            n = "",
            s = "",
            o = "",
            i = "",
            l = "",
            c = "",
            d = "",
            p = "",
            m = "";
        "undefined" != typeof e.prop_name && (_ = e.prop_name), "undefined" != typeof e.prop_row_class && (m = e.prop_row_class), "undefined" != typeof e.value && (a = "value=\"" + e.value + "\""), "undefined" != typeof e.text_value && (r = e.text_value), "undefined" != typeof e.text_rows && (n = "rows=\"" + e.text_rows + "\""), "undefined" != typeof e.placeholder && (s = "placeholder=\"" + e.placeholder + "\""), "undefined" != typeof e.id && (o = "id=\"" + e.id + "\""), "undefined" != typeof e.functions && $.each(e.functions, function(e, t) {
            i = i + t.type + "=\"" + t.name + "(" + t.param + ")\" "
        }), "undefined" != typeof e.data_params && $.each(e.data_params, function(e, t) {
            l = l + t.name + "=\"" + t.param + "\" "
        }), "undefined" != typeof e.html && (c = e.html), "undefined" != typeof e.disabled && (d = e.disabled), "undefined" != typeof e.readonly && !0 == e.readonly && (p = "readonly");
        var h = "";
        switch (e.type) {
            case "input_text":
                t = "<input type=\"text\" class=\"form-control\" " + a + " " + s + " " + o + " " + i + " " + l + " " + d + " " + p + ">", h = "<div class=\"d_prop " + m + "\"><div class=\"d_prop_name\">" + _ + "</div><div class=\"d_prop_val\">" + t + "</div><div class=\"d_prop_subm\"><i class=\"fa fa-check\" onclick=\"SimpleCad.Action({'type':'ObjectTablePropsInputChangeSubmit','thisObject':$(this)});\"></i><i class=\"fa fa-times\" onclick=\"SimpleCad.Action({'type':'ObjectTablePropsInputChangeCancel'});\"></i></div>";
                break;
            case "textarea":
                t = "<textarea class=\"form-control\" " + n + " " + s + " " + o + " " + i + " " + l + " " + d + " " + p + ">" + r + "</textarea>", h = "<div class=\"d_prop " + m + "\"><div class=\"d_prop_name\">" + _ + "</div><div class=\"d_prop_val\">" + t + "</div><div class=\"d_prop_subm\"><i class=\"fa fa-check\" onclick=\"SimpleCad.Action({'type':'ObjectTablePropsInputChangeSubmit','thisObject':$(this)});\"></i><i class=\"fa fa-times\" onclick=\"SimpleCad.Action({'type':'ObjectTablePropsInputChangeCancel'});\"></i></div>";
                break;
            case "modal":
                t = "<div class=\"d_prop_modal\"  " + o + " " + i + " " + l + " >" + c + "</div>", h = "<div class=\"d_prop " + m + "\"><div class=\"d_prop_name\">" + _ + "</div><div class=\"d_prop_val\">" + t + "</div></div>";
                break;
            default:
        }
        $("#add_object_table").append(h)
    }

    /**
     * Сбрасывает состояние CAD редактора и очищает выделенные элементы.
     * Функция отключает активные кнопки рисования, снимает выделение
     * с элементов панели и очищает временные объекты.
     */
    function resetCADState() {
        // Отключаем кнопки завершения рисования
        c_("btn_finish_cad_draw"); 
        c_("btn_finish_cad_draw_close"); 
        
        // Снимаем выделение с элементов управления
        ne(); // Снимает выделение с элементов аккордеона
        se(); // Снимает выделение с объектов в списке объектов
        oe(); // Очищает таблицу объектов
        
        // Очищаем рабочую область
        ie(); // Сбрасывает стили элементов к значениям по умолчанию
        je(); // Скрывает вспомогательные линии
        
        // Обновляем состояние и интерфейс
        Ra(); // Обновляет координаты указателя
        Ha(); // Обновляет информацию активного слоя
        Ja(); // Обновляет доступность кнопок и контролов
    }

    function ae() {
        oi = {}, ii = {}, H_({
            is_layers_redraw: !0
        }), sl.hide()
    }

    function re() {
        rl.find(".active").removeClass("active")
    }

    function ne() {
        el.find(".active").removeClass("active")
    }

    function se() {
        tl.find(".active").removeClass("active"), C_()
    }

    function oe() {
        _l.empty()
    }

    function ie() {
        $.each(to[vo].children, function(e, t) {
            switch (t.className) {
                case "Line":
                    var _ = t.id();
                    if ("undefined" != typeof _ && -1 < _.indexOf("__")) {
                        var a = _.substr(0, _.indexOf("__"));
                        switch (a) {
                            case "lineblock":
                                t.stroke(mainColors.lineblock_color);
                                break;
                            default:
                                t.stroke(mainColors.default_element_color);
                        }
                    }
                    break;
                case "Arrow":
                    t.stroke(mainColors.default_element_color), t.fill(mainColors.default_element_color);
                    break;
                case "Text":
                    t.fill(mainColors.default_element_color);
                    break;
                default:
            }
        }), $.each(Rs[vo].children, function(e, t) {
            switch (t.className) {
                case "Line":
                    t.stroke(mainColors.default_element_color);
                    break;
                case "Arc":
                    t.stroke(mainColors.default_element_color), t.fill(mainColors.default_element_color);
            }
        }), ce(), to[vo].draw()
    }

    function le() {
        var e = he();
        if ("undefined" == typeof ro[vo]) {
            var t = new Image;
            t.onload = function() {
                ro[vo] = new Konva.Image({
                    x: e.x,
                    y: e.y,
                    image: t,
                    width: 16,
                    height: 16,
                    draggable: !0,
                    id: "move_image__" + vo
                }), ro[vo].on("mouseover", function() {
                    document.body.style.cursor = "pointer"
                }), ro[vo].on("mouseout", function() {
                    document.body.style.cursor = "default"
                }), ro[vo].on("dragstart", function() {
                    de()
                }), ro[vo].on("dragend", function() {
                    pe()
                }), ro[vo].on("dragmove", function() {
                    me()
                }), to[vo].add(ro[vo]), to[vo].draw()
            }, t.src = Ys + "online/move.png"
        } else ro[vo].setAttrs({
            visible: !0,
            x: e.x,
            y: e.y
        }), to[vo].draw()
    }

    function ce() {
        "undefined" != typeof ro[vo] && (ro[vo].visible(!1), to[vo].draw())
    }

    function de() {
        Qi = Zi.clone()
    }

    function pe() {
        yt(Zi.id(), !1), processElementById(Zi.id()), He(Zi), to[vo].draw()
    }

    function me() {
        if ("undefined" != typeof Zi && "undefined" != Zi) {
            switch (Zi.className) {
                case "Line":
                case "Arrow":
                    var e = Zi.points(),
                        t = e.length,
                        _ = Qi.points();
                    e[0] = ro[vo].attrs.x + 20, e[1] = ro[vo].attrs.y - 10;
                    for (var a = 0, r = 0, n = 2; n < t; n += 2) a = _[n] - _[0], r = _[n + 1] - _[1], e[n] = e[0] + a, e[n + 1] = e[1] + r;
                    Zi.setAttrs({
                        points: e
                    }), Tt(Zi.id()), processAndClearElement(Zi), He(Zi);
                    break;
                case "Text":
                    Zi.setAttrs({
                        x: ro[vo].attrs.x + 20,
                        y: ro[vo].attrs.y - 20
                    });
                    break;
                default:
            }
            Zi.draw()
        }
    }

    function he() {
        var e = {
            x: 300,
            y: 300
        };
        switch (Zi.className) {
            case "Line":
            case "Arrow":
                e.x = Zi.attrs.points[0] - 20, e.y = Zi.attrs.points[1] + 10;
                break;
            case "Text":
                e.x = Zi.attrs.x - 20, e.y = Zi.attrs.y + 20;
                break;
            default:
        }
        return e
    }

    function ue(e) {
        switch (Oo.mode = e.mode, Oo.mode) {
            case "default":
                break;
            case "moveall":
                break;
            case "add_element":
                Oo["data-element"] = e["data-element"];
                break;
            default:
        }
    }

    /**
     * Переключает редактор CAD в стандартный режим работы.
     * Сбрасывает режим и тип элемента на значения по умолчанию, 
     * активирует кнопку выбора в панели инструментов.
     * 
     * Эта функция используется для переключения в режим выбора элементов
     * из любого другого режима (например, рисования фигур) и визуально
     * отображает это состояние в интерфейсе.
     */
    function setDefaultMode() {
        // Устанавливаем режим редактора в значение "default"
        Oo.mode = "default";
        
        // Устанавливаем тип активного элемента на "default"
        Oo["data-element"] = "default";
        
        // Делаем кнопку инструмента выбора активной в интерфейсе
        nl.addClass("active");
    }

    function ge() {
        Oo.mode = "moveall", Oo["data-element"] = "default"
    }

    function ye(e) {
        if (2 == e.evt.button) return e.evt.preventDefault(), ya(e), !1;
        switch ($o && (kl.hide(), $o = !1), Oo.mode) {
            case "default":
                resetCADState(), setDefaultMode(), Zi = "undefined", zi = "";
                break;
            case "add_element":
                z(e);
                break;
            default:
        }
    }

    function be(e) {
        switch (Oo.mode) {
            case "moveall":
                Po = !0, Io = e.evt.layerX, Yo = e.evt.layerY;
                break;
            case "default":
            case "":
                switch (e.evt.button) {
                    case 0:
                        fn(e.evt.layerX, e.evt.layerY, e.evt.ctrlKey);
                        break;
                    case 1:
                        Po = !0, Io = e.evt.layerX, Yo = e.evt.layerY;
                        break;
                    default:
                }
                break;
            default:
        }
    }

    function ve(e) {
        switch (Oo.mode) {
            case "moveall":
                Po = !1, gt({});
                break;
            case "default":
            case "":
                switch (e.evt.button) {
                    case 0:
                        gn();
                        break;
                    case 1:
                        Po = !1, gt({});
                        break;
                    default:
                }
                break;
            default:
        }
    }

    /**
     * Обрабатывает движение мыши на холсте для различных режимов работы.
     * Обновляет положение вспомогательных линий, обрабатывает привязку к объектам
     * и отображает координаты курсора.
     *
     * @param {Object} event - Объект события движения мыши
     * @param {Object} event.evt - Нативный объект события
     * @param {number} event.evt.layerX - Координата X курсора относительно холста
     * @param {number} event.evt.layerY - Координата Y курсора относительно холста
     */
    function handleCanvasMouseMove(event) {

        if (isRotateClick) {
            // Если активирован режим вращения, определим направление движения мыши
            
            // Сохраняем текущую позицию мыши
            var currentMouseX = event.evt.layerX;
            var currentMouseY = event.evt.layerY;
            
            // Если у нас еще нет предыдущей позиции мыши
            if (!window.lastMousePosition) {
                window.lastMousePosition = {
                    x: currentMouseX,
                    y: currentMouseY
                };
                return; // Пропускаем первый кадр для сбора начальных данных
            }
            
            // Если выбран элемент и мы можем определить его центр
            if (typeof Zi !== "undefined" && Zi !== "undefined") {

                // TODO: центр элемента считается неверно.
                // Определяем центр элемента для расчета угла
                var elementCenter = getElementCenter(Zi);
                
                // Вычисляем углы для предыдущей и текущей позиции мыши относительно центра элемента
                var previousAngle = Math.atan2(
                    window.lastMousePosition.y - elementCenter.y, 
                    window.lastMousePosition.x - elementCenter.x
                );
                var currentAngle = Math.atan2(
                    currentMouseY - elementCenter.y, 
                    currentMouseX - elementCenter.x
                );
                
                // Вычисляем разницу между углами (в радианах)
                var deltaAngle = currentAngle - previousAngle;
                
                // Нормализация deltaAngle, чтобы избежать скачков при переходе через ±π
                if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
                if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
                
                // Определяем направление вращения
                var rotationDirection = deltaAngle > 0 ? 1 : -1;
                
                // Применяем вращение к элементу (используем небольшое значение для плавности)
                var rotationAmount = 1 * rotationDirection;
                rotateElement(Zi, rotationAmount, true);
                
                // Обновляем позицию для следующего кадра
                window.lastMousePosition = {
                    x: currentMouseX,
                    y: currentMouseY
                };
            }
        }

        // Обработка в зависимости от текущего режима
        switch (Oo.mode) {
            case "default":
                // Проверяем активен ли режим выделения
                if (Xo.is_active) {
                    // Обновляем область выделения
                    yn(event.evt.layerX, event.evt.layerY);
                } else if (Po) {
                    // Если активен режим перемещения, обновляем позицию холста
                    ze(event);
                }
                break;

            case "moveall":
                // В режиме перемещения всего содержимого
                if (Po) {
                    ze(event);
                }
                break;

            case "add_element":
                // В режиме добавления элемента
                handleMouseMoveWhileAddingElement(event);
                break;

            default:
                // Для других режимов действий не требуется
        }

        // Проверяем привязку к объектам
        if (mi) {
            // Вычисляем расстояние до ближайшего объекта привязки
            var snapDistance = va(
                event.evt.layerX,
                event.evt.layerY,
                no[vo].attrs.points[0],
                no[vo].attrs.points[1],
                no[vo].attrs.points[2],
                no[vo].attrs.points[3]
            );

            // Если расстояние больше порога привязки, скрываем индикатор
            if (snapDistance > 5) {
                no[vo].hide();
                so[vo].hide();
                to[vo].draw();
                mi = false;
            }
        }
    }


    /**
     * Вычисляет центр элемента.
     * @param {Object} element - Элемент Konva
     * @returns {Object} - Координаты центра элемента {x, y}
     */
    function getElementCenter(element) {
        // Определяем центр элемента в зависимости от его типа
        switch (element.className) {
            case 'Line':
            case 'Arrow':
                // Для линий и стрелок вычисляем центр как среднее всех точек
                var points = element.points();
                var sumX = 0, sumY = 0;
                for (var i = 0; i < points.length; i += 2) {
                    sumX += points[i];
                    sumY += points[i + 1];
                }
                return {
                    x: sumX / (points.length / 2),
                    y: sumY / (points.length / 2)
                };
            case 'Text':
                // Для текста центр - это его координаты плюс половина размеров
                return {
                    x: element.x() + element.width() / 2,
                    y: element.y() + element.height() / 2
                };
            default:
                // Для других типов - просто координаты
                return {
                    x: element.x(),
                    y: element.y()
                };
        }
    }

    function we(e) {
        if (y_("is_canvas_image_mouse_wheel")) {
            var t = "";
            t = 0 > e.evt.deltaY ? "+" : "-", Ke(t, "", !0, !0), e.evt.preventDefault()
        }
    }

    function ze(e) {
        var t = e.evt.layerX,
            _ = e.evt.layerY,
            a = t - Io,
            r = _ - Yo;
        Me(a, r), Fo[vo] += a, Ao[vo] += r, drawGrid(), w(), to[vo].batchDraw(), Io = t, Yo = _
    }

    function je() {
        "undefined" != typeof Ms[vo] && (Ms[vo].hide(), ao = !0, to[vo].draw())
    }

    /**
     * Обновляет положение вспомогательных линий и текста для отображения углов и координат.
     * 
     * Если вспомогательные элементы ещё не созданы, они создаются. В противном случае
     * обновляются их координаты и свойства.
     * 
     * @param {Object} event - Событие мыши, содержащее координаты курсора.
     * @param {number} event.evt.layerX - Координата X курсора относительно слоя.
     * @param {number} event.evt.layerY - Координата Y курсора относительно слоя.
     */
    function updateHelperLinesAndText(event) {
        // Если вспомогательная группа ещё не создана, создаём её
        if (typeof Ms[vo] === "undefined") {
            // Создаём новую группу для вспомогательных элементов
            Ms[vo] = new Konva.Group({
                x: 0,
                y: 0,
                id: "sight_group__" + vo
            });
            to[vo].add(Ms[vo]);

            // Создаём вертикальную линию
            _o[vo + "_1"] = new Konva.Line({
                points: [event.evt.layerX, event.evt.layerY, event.evt.layerX, 0],
                stroke: mainColors.sight_color,
                strokeWidth: 1,
                object_visible: 1,
                listening: false
            });
            Ms[vo].add(_o[vo + "_1"]);

            // Создаём горизонтальную линию
            _o[vo + "_2"] = new Konva.Line({
                points: [event.evt.layerX, event.evt.layerY, Bi.width(), event.evt.layerY],
                stroke: mainColors.sight_color,
                strokeWidth: 1,
                object_visible: 1,
                listening: false
            });
            Ms[vo].add(_o[vo + "_2"]);

            // Создаём линию вниз
            _o[vo + "_3"] = new Konva.Line({
                points: [event.evt.layerX, event.evt.layerY, event.evt.layerX, Bi.height()],
                stroke: mainColors.sight_color,
                strokeWidth: 1,
                object_visible: 1,
                listening: false
            });
            Ms[vo].add(_o[vo + "_3"]);

            // Создаём линию влево
            _o[vo + "_4"] = new Konva.Line({
                points: [event.evt.layerX, event.evt.layerY, 0, event.evt.layerY],
                stroke: mainColors.sight_color,
                strokeWidth: 1,
                object_visible: 1,
                listening: false
            });
            Ms[vo].add(_o[vo + "_4"]);

            // Создаём текст для отображения угла
            _o[vo + "_cur_angle"] = new Konva.Text({
                x: event.evt.layerX + 30,
                y: event.evt.layerY + 5,
                text: "угол = 0°; длина = 0",
                fontSize: 12,
                fontFamily: "Arial",
                rotation: 0,
                fill: "#333",
                draggable: false,
                visible: false
            });
            Ms[vo].add(_o[vo + "_cur_angle"]);

            // Создаём текст для отображения координат
            _o[vo + "_cur_xy"] = new Konva.Text({
                x: event.evt.layerX + 30,
                y: event.evt.layerY + 30,
                text: "",
                fontSize: 12,
                fontFamily: "Arial",
                rotation: 0,
                fill: "#333",
                draggable: false,
                visible: false
            });
            Ms[vo].add(_o[vo + "_cur_xy"]);
        } else {
            // Обновляем координаты вспомогательных линий
            _o[vo + "_1"].setAttrs({
                points: [event.evt.layerX, event.evt.layerY - 2, event.evt.layerX, 0]
            });
            _o[vo + "_2"].setAttrs({
                points: [event.evt.layerX + 2, event.evt.layerY, Bi.width(), event.evt.layerY]
            });
            _o[vo + "_3"].setAttrs({
                points: [event.evt.layerX, event.evt.layerY + 2, event.evt.layerX, Bi.height()]
            });
            _o[vo + "_4"].setAttrs({
                points: [event.evt.layerX - 2, event.evt.layerY, 0, event.evt.layerY]
            });

            // Обновляем информацию о рисовании линий
            updateLineDrawingInfo(event);
        }

        // Если вспомогательные элементы были скрыты, показываем их
        if (ao) {
            Ms[vo].show();
            ao = false;
        }

        // Перерисовываем слой
        to[vo].batchDraw();
    }

    /**
     * Обновляет информацию об угле и координатах при рисовании линий.
     * 
     * @param {Object} event - Событие мыши, содержащее координаты курсора.
     * @param {number} event.evt.layerX - Координата X курсора относительно слоя.
     * @param {number} event.evt.layerY - Координата Y курсора относительно слоя.
     */
    function updateLineDrawingInfo(event) {
        switch (Oo.mode) {
            case "add_element":
                switch (Oo["data-element"]) {
                    case "line":
                    case "pline":
                        if ("undefined" != typeof Zi && "undefined" !== Zi && "Line" == Zi.className) {
                            var mouseX = event.evt.layerX,
                                mouseY = event.evt.layerY,
                                elementId = Zi.id(),
                                elementType = "",
                                angleInfo = "",
                                coordsInfo = "",
                                originX = 0,
                                originY = 0,
                                isValidElement = false,
                                deltaX = 0,
                                deltaY = 0;
                            
                            if (-1 < elementId.indexOf("__")) {
                                elementType = elementId.substr(0, elementId.indexOf("__"));
                                switch (elementType) {
                                    case "line":
                                        var points = Zi.points();
                                        var angle = calculateAngle(points[0], -1e4, points[0], points[1], mouseX, mouseY, true, true, false);
                                        var length = Te(points[0], points[1], mouseX, mouseY, false);
                                        angleInfo = "угол = " + angle.toFixed(2) + "°; длина = " + (100 * length / Go.g_scale[vo]).toFixed(yi.length.prec);
                                        originX = points[0];
                                        originY = points[1];
                                        isValidElement = true;
                                        break;
                                    case "pline":
                                        var points = Zi.points();
                                        var pointsCount = points.length;
                                        var length = "";
                                        var angle = 0;                                    

                                        if (4 === pointsCount) {
                                            angle = calculateAngle(points[0], -1e4, points[0], points[1], mouseX, mouseY, true, true, false);
                                            length = Te(points[0], points[1], mouseX, mouseY, false);
                                            originX = points[0];
                                            originY = points[1];
                                            isValidElement = true;
                                        } else if (6 <= pointsCount) {
                                            if (checkMagnet30(event.evt)) {
                                                var lastPointX = points[pointsCount - 2];
                                                var lastPointY = points[pointsCount - 1];
                                            }
                                            else {                                                
                                                var lastPointX = mouseX
                                                var lastPointY = mouseY
                                            }

                                            angle = calculateAngle(points[pointsCount - 6], points[pointsCount - 5], points[pointsCount - 4], points[pointsCount - 3], lastPointX, lastPointY, true, true, false);
                                            length = Te(points[pointsCount - 4], points[pointsCount - 3], mouseX, mouseY, false);
                                            originX = points[pointsCount - 4];
                                            originY = points[pointsCount - 3];
                                            isValidElement = true;
                                        }

                                        length = "; длина = " + (100 * length / Go.g_scale[vo]).toFixed(0);
                                        angleInfo = "угол = " + angle.toFixed(0) + "°" + length;
                                        break;
                                }
                            }

                            if (false && isValidElement) {
                                deltaX = mouseX > originX ? mouseX - originX : -1 * (originX - mouseX);
                                deltaY = mouseY > originY ? -1 * (mouseY - originY) : originY - mouseY;
                                coordsInfo = "X = " + (100 * deltaX / Go.g_scale[vo]).toFixed(3) + "; Y = " + (100 * deltaY / Go.g_scale[vo]).toFixed(3);
                            }

                            _o[vo + "_cur_angle"].setAttrs({
                                x: event.evt.layerX + 30,
                                y: event.evt.layerY + 5,
                                text: angleInfo
                            });

                            // _o[vo + "_cur_xy"].setAttrs({
                            //     x: event.evt.layerX + 30,
                            //     y: event.evt.layerY + 30,
                            //     text: coordsInfo
                            // });

                            showHelperLinesAndText();
                            handleOrthogonalAxisHighlight(event);
                        } else {
                            hideHelperLinesAndText();
                            resetHelperLineHighlighting();
                        }
                        break;
                    default:
                        hideHelperLinesAndText();
                        resetHelperLineHighlighting();
                }
                break;
            default:
                hideHelperLinesAndText();
                resetHelperLineHighlighting();
        }
    }

    var isMagnet30click = false;
    function handlerMagnet30(event) {
        if (! $('[data-element="pline"]').hasClass('active')) {
            return;
        }

        if ($magnet30.hasClass('active')) {
            $magnet30.removeClass('active')
            isMagnet30click = false;
        }
        else {
            isMagnet30click = true;
            $magnet30.addClass('active');
        } 
    }

    function handlerRotate(event) {
        $(".d_elements_button").removeClass('active');

        if (Oo.mode == 'add_element') {
            gs();
            polylineId = Zi.id();
            let points = Zi.points();
            
            points = points.slice(0, points.length - 2);        
    
            Zi.setPoints(points);
            processAndClearElement(Zi);
            yt(Zi.id(), false);
            processElementAndAddMovePoints(Zi, false);

            En();
        }

        gs();


        if ($rotate.hasClass('active')) {
            $rotate.removeClass('active')
            isRotateClick = false;
        }
        else {
            $rotate.addClass('active');
            isRotateClick = true;
        }

        setTimeout(function() {
            $(document).on('click', function(event) {
                if (isRotateClick) {
                    $rotate.removeClass('active');
                    isRotateClick = false;
                    $(document).off('click');
                }
            });
        }, 200)
    }

    function checkMagnet30(event) {
        if (isMagnet30click && $magnet30.hasClass('active')) {
            return true;
        }
        else if (event && event.shiftKey) {
            $magnet30.addClass('active');
            return true;
        }
        else if (event && ! isMagnet30click && !event.shiftKey) {
            $magnet30.removeClass('active')    
        }        
    }

    /**
     * Скрывает вспомогательные линии и текстовые элементы на холсте.
     * 
     * Если вспомогательные линии и текстовые элементы видимы, делает их невидимыми
     * и перерисовывает слой.
     */
    function hideHelperLinesAndText() {
        // Проверяем, видимы ли вспомогательные линии и текстовые элементы
        if (Do) {
            // Устанавливаем флаг, что элементы теперь скрыты
            Do = false;

            // Скрываем текст угла
            _o[vo + "_cur_angle"].hide();

            // Скрываем текст координат
            _o[vo + "_cur_xy"].hide();

            // Перерисовываем вспомогательную группу
            Ms[vo].draw();
        }
    }

    /**
     * Показывает вспомогательные линии и текстовые элементы на холсте.
     * 
     * Если вспомогательные линии и текстовые элементы скрыты, делает их видимыми
     * и перерисовывает слой.
     */
    function showHelperLinesAndText() {
        // Проверяем, скрыты ли вспомогательные линии и текстовые элементы
        if (Do === false) {
            // Устанавливаем флаг, что элементы теперь видимы
            Do = true;

            // Показываем текст угла
            _o[vo + "_cur_angle"].show();

            // Показываем текст координат
            _o[vo + "_cur_xy"].show();

            // Перерисовываем вспомогательную группу
            Ms[vo].draw();
        }
    }

    /**
     * Обрабатывает событие перемещения мыши при добавлении элемента.
     * 
     * В зависимости от текущего режима и типа добавляемого элемента, обновляет
     * положение вспомогательных линий, дуг и других элементов на холсте.
     * 
     * @param {Object} event - Событие мыши, содержащее координаты курсора.
     */
    function handleMouseMoveWhileAddingElement(event) {
        // Обновляем вспомогательные линии и дуги для текущего положения курсора
        updateHelperLinesAndText(event);

        // Если активный элемент определён, обрабатываем его в зависимости от типа
        if (typeof Zi !== "undefined" && Zi !== "undefined") {
            switch (Oo["data-element"]) {
                case "line":
                case "pline":
                    // Обновляем координаты последней точки полилинии
                    updatePolylineLastPoint(event.evt.layerX, event.evt.layerY, event);
                    break;

                case "arrow":
                    // Обработка стрелки в зависимости от подрежима
                    switch (Oo.arrow_submode) {
                        case "default":
                            // Основной режим стрелки
                            break;

                        case "second":
                            // Обновляем координаты для второго этапа добавления стрелки
                            updatePolylineLastPoint(event.evt.layerX, event.evt.layerY, event);
                            break;

                        default:
                            // Для других подрежимов обработка не предусмотрена
                    }
                    break;

                case "text":
                    // Для текста обработка не предусмотрена
                    break;

                case "default":
                    // Для режима по умолчанию обработка не предусмотрена
                    break;

                default:
                    // Для других типов элементов обработка не предусмотрена
            }
        }
    }

    /**
 * Обновляет координаты последней точки полилинии.
 *
 * Если зажата клавиша Shift, корректирует координаты так, чтобы линия рисовалась
 * только под углом, кратным 90 градусам.
 *
 * @param {number} x - Новая координата X для последней точки.
 * @param {number} y - Новая координата Y для последней точки.
 * @param {Object} event - Событие мыши, содержащее информацию о нажатых клавишах.
 */
function updatePolylineLastPoint(x, y, event) {
    // Получаем массив точек текущей полилинии
    var points = Zi.points();

    // Определяем количество точек в полилинии
    var totalPoints = points.length;

    // Определяем индексы последней точки
    var lastPointIndices = {
        x: totalPoints - 4, // Предпоследняя точка X
        y: totalPoints - 3, // Предпоследняя точка Y
        lastX: totalPoints - 2, // Последняя точка X
        lastY: totalPoints - 1  // Последняя точка Y
    };

    // Получаем координаты предыдущей точки
    var prevX = points[lastPointIndices.x];
    var prevY = points[lastPointIndices.y];

    // Вычисляем разницу координат
    var deltaX = x - prevX;
    var deltaY = y - prevY;

    // Если зажата клавиша Shift, корректируем координаты
    if (checkMagnet30(event.evt)) {
        const angle = Math.atan2(deltaY, deltaX);
        const step = Math.PI / 6; // 30 градусов в радианах
        const snappedAngle = Math.round(angle / step) * step;
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        deltaX = length * Math.cos(snappedAngle);
        deltaY = length * Math.sin(snappedAngle);
    }

    // Обновляем координаты последней точки
    points[lastPointIndices.lastX] = prevX + deltaX;
    points[lastPointIndices.lastY] = prevY + deltaY;

    // Устанавливаем обновлённые точки обратно в полилинию
    Zi.setPoints(points);
}

    function Te(e, t, _, a, r) {
        var n = Math.dist(e, t, _, a);
        return r && (n = Math.round(n)), n
    }

    function Se(e, t, _, a) {
        return {
            line_center_x: 0,
            line_center_y: 0,
            line_center_x: e + (_ - e) / 2,
            line_center_y: t + (a - t) / 2
        }
    }

    function Pe(e, t, _, a, r, n, s) {
        var o = Ye(r, s);
        return n && (o.delta_x = o.delta_x / 100 * Go.g_scale[vo], o.delta_y = o.delta_y / 100 * Go.g_scale[vo]), {
            points: [e + o.delta_x, t + o.delta_y, _ + o.delta_x, a + o.delta_y],
            delta_x: o.delta_x,
            delta_y: o.delta_y,
            chetv: o.chetv
        }
    }

    function Ie(e, t, _, a, r) {
        var n = Ye(_, r);
        return a && (n.delta_x = n.delta_x / 100 * Go.g_scale[vo], n.delta_y = n.delta_y / 100 * Go.g_scale[vo]), {
            points: [e, t, e + n.delta_x, t + n.delta_y],
            delta_x: n.delta_x,
            delta_y: n.delta_y,
            chetv: n.chetv
        }
    }

    function Ye(e, t) {
        var _ = 1e-4,
            a = 0,
            r = 0,
            n = "";
        180 < t ? t -= 360 : -180 > t && (t += 360);
        var s = Math.abs(t);
        switch (t) {
            case 0:
            case -0:
                n = "up";
                break;
            case 90:
                n = "right";
                break;
            case 180:
            case -180:
                n = "down";
                break;
            case -90:
                n = "left";
                break;
            default:
                0 < t ? 90 > t ? t <= _ ? n = "up" : t > _ && 90 - t > _ ? n = "1" : n = "right" : t - 90 <= _ ? n = "right" : t - 90 > _ && 180 - t > _ ? n = "2" : n = "down" : 0 > t && (-90 < t ? s <= _ ? n = "up" : s > _ && 90 - s > _ ? n = "4" : n = "left" : s - 90 <= _ ? n = "left" : s - 90 > _ && 180 - s > _ ? n = "3" : n = "down");
        }
        switch (n) {
            case "up":
                a = 0, r = -1 * e;
                break;
            case "1":
                a = e * Math.abs(Math.sin(t * l["pi/180"])), r = -1 * e * Math.abs(Math.cos(t * l["pi/180"]));
                break;
            case "right":
                a = e, r = 0;
                break;
            case "2":
                a = e * Math.abs(Math.cos((t - 90) * l["pi/180"])), r = e * Math.abs(Math.sin((t - 90) * l["pi/180"]));
                break;
            case "down":
                a = 0, r = e;
                break;
            case "3":
                a = -1 * e * Math.abs(Math.cos((s - 90) * l["pi/180"])), r = e * Math.abs(Math.sin((s - 90) * l["pi/180"]));
                break;
            case "left":
                a = -1 * e, r = 0;
                break;
            case "4":
                a = -1 * e * Math.abs(Math.sin(s * l["pi/180"])), r = -1 * e * Math.abs(Math.cos(s * l["pi/180"]));
                break;
            default:
        }
        return {
            delta_x: a,
            delta_y: r,
            chetv: n
        }
    }

    function De(e, t, _, a) {
        var r = e[2 * _ + 2],
            n = e[2 * _ + 3],
            s = Ge(e[2 * _ + 0], e[2 * _ + 1], e[2 * _ + 2], e[2 * _ + 3]),
            o = 1,
            i = 1;
        switch (s) {
            case "1":
            case "2":
            case "up":
            case "right":
            case "down":
                o = 1, i = -1;
                break;
            case "3":
            case "4":
            case "left":
                o = -1, i = -1;
                break;
            default:
        }
        var c = e[2 * _ + 0] + o * t * Math.sin(a * l["pi/180"]),
            d = e[2 * _ + 1] + i * t * Math.cos(a * l["pi/180"]);
        return {
            delta_x: c - r,
            delta_y: d - n
        }
    }

    /**
     * Вычисляет угол между двумя линиями или точками.
     *
     * @param {number} x1 - Координата X первой точки первой линии.
     * @param {number} y1 - Координата Y первой точки первой линии.
     * @param {number} x2 - Координата X второй точки первой линии.
     * @param {number} y2 - Координата Y второй точки первой линии.
     * @param {number} x3 - Координата X первой точки второй линии.
     * @param {number} y3 - Координата Y первой точки второй линии.
     * @param {boolean} normalize - Указывает, нужно ли нормализовать угол.
     * @param {boolean} round - Указывает, нужно ли округлять угол.
     * @param {boolean} inRadians - Указывает, нужно ли возвращать угол в радианах (по умолчанию в градусах).
     * @returns {number} - Вычисленный угол между линиями или точками.
     */
    function calculateAngle(x1, y1, x2, y2, x3, y3, normalize, round, inRadians) {
        // Вычисляем угол между линиями с использованием встроенной функции Math.angle
        var angle = Math.angle(x1, y1, x2, y2, x3, y3, normalize, round);

        // Если требуется округление, округляем угол
        if (inRadians) {
            angle = Math.round(angle);
        }

        return angle;
    }

    function Ge(e, t, _, a) {
        var r = "";
        return (0 > t || 0 > a) && (r = "stop"), e = +e.toFixed(3), _ = +_.toFixed(3), t = +t.toFixed(3), a = +a.toFixed(3), e < _ && t > a ? r = "1" : e < _ && t < a ? r = "2" : e > _ && t < a ? r = "3" : e > _ && t > a ? r = "4" : e == _ && t > a ? r = "up" : e == _ && t < a ? r = "down" : e > _ && t == a ? r = "left" : e < _ && t == a && (r = "right"), r
    }

    function We(e, t, _, a, r) {
        e = parseFloat(e), t = parseFloat(t), _ = parseFloat(_), a = parseFloat(a);
        var n = 0,
            s = 0;
        e -= _, t -= a, n = e * Math.cos(r) - t * Math.sin(r), s = e * Math.sin(r) + t * Math.cos(r), n += _, s += a;
        var o = {
            endPoint_x: n.toFixed(6),
            endPoint_y: s.toFixed(6)
        };
        return o
    }

    function Ke(e, t, _, a) {        
        Ee(vo, !1, !1, !1, !1);
        Ve(e, t);
        var r = Ee(vo, !1, !1, !1, !1),
            n = 0,
            s = 0;
        n = r.x_min - Fo[vo], s = r.y_max - Ao[vo];
        Me(-n, -s), _ && drawGrid(), a && refreshCurrentLayer()
    }

   /**
     * Обновляет текущий слой, очищает временные элементы и перерисовывает сцену.
     */
    function refreshCurrentLayer() {
        // Обрабатываем все элементы на текущем слое
        processLayerElements({});

        // Очищаем временные элементы
        Re(); // Удаление временных объектов
        gt({}); // Обновление видимости объектов
        qa({}); // Дополнительная обработка объектов
        W_({}); // Очистка вспомогательных данных
        ms(); // Очистка дополнительных данных

        // Если активный элемент существует, отображаем его, иначе скрываем
        if (typeof Zi !== "undefined" && Zi !== "undefined") {
            le(); // Отображение активного элемента
        } else {
            ce(); // Скрытие активного элемента
        }

        // Перемещаем группы слоёв на передний план
        Es[vo].moveToTop();
        Zs[vo].moveToTop();

        // Перерисовываем текущий слой
        to[vo].batchDraw();
    }

    function Ve(e, t) {
        100 != Go.g_scale[vo] && $e(100 / Go.g_scale[vo]);
        var _ = Go.g_scale[vo] / 20;
        switch (e) {
            case "+":
                Go.g_scale[vo] += _;
                break;
            case "-":
                50 < Go.g_scale[vo] && (Go.g_scale[vo] -= _);
                break;
            case "=":
                Go.g_scale[vo] = t;
                break;
            default:
        }
        $e(Go.g_scale[vo] / 100)
    }

    function $e(e) {
        $.each(to[vo].children, function(t, _) {
            switch (_.className) {
                case "Line":
                case "Arrow":
                    for (var a = _.points(), r = a.length, n = 0; n < r; n++) a[n] *= e;
                    _.setPoints(a);
                    break;
                case "Text":
                    _.setAttrs({
                        x: _.x() * e,
                        y: _.y() * e
                    });
                    break;
                default:
            }
        })
    }

    function Ee(e, t, _, a, r) {
        var n = 1e5,
            s = -1e5,
            o = 1e5,
            l = -1e5;
        $.each(to[e].children, function(t, c) {
            if (("undefined" != typeof c.attrs.name || "undefined" != typeof c.attrs.is_table_cad_block && a) && c.isVisible()) switch (c.className) {
                case "Line":
                case "Arrow":
                    if ("Line" == c.className || "Arrow" == c.className && _) {
                        var d = c.points(),
                            p = d.length,
                            m = {
                                x: 0,
                                y: 0
                            };
                        "undefined" != typeof c.attrs.offset_origin;
                        for (var h = {
                                x: m.x * Go.g_scale[e] / 100,
                                y: m.y * Go.g_scale[e] / 100
                            }, u = 0; u < p; u++) u % 2 ? (d[u] < o && (o = d[u]), d[u] + h.y > l && (l = d[u] + h.y)) : (d[u] - h.x < n && (n = d[u] - h.x), d[u] > s && (s = d[u]))
                    }
                    break;
                case "Text":
                    r && (c.y() < o && (o = c.y()), c.y() > l && (l = c.y()), c.x() < n && (n = c.x()), c.x() > s && (s = c.x()));
                    break;
                default:
            }
        }), t && $.each(Bs[e].children, function(e, t) {
            "undefined" != typeof t.attrs.sheet_i && (t.y() + t.height() < o && (o = t.y() + t.height()), t.y() > l && (l = t.y()), t.x() < n && (n = t.x()), t.x() + t.width() > s && (s = t.x() + t.width()))
        });
        var c = {
            x_min: n,
            x_max: s,
            y_min: o,
            y_max: l,
            width: s - n,
            height: l - o
        };
        return c
    }

    function Me(e, t) {
        $.each(to[vo].children, function(_, a) {
            switch (a.className) {
                case "Line":
                case "Arrow":
                    for (var r = a.points(), n = r.length, s = 0; s < n; s++) r[s] += s % 2 ? t : e;
                    a.setPoints(r);
                    break;
                case "Text":
                    a.setAttrs({
                        x: a.x() + e,
                        y: a.y() + t
                    });
                    break;
                default:
            }
        }), processLayerElements({}), Re(), qa({}), W_({})
    }

    function Re() {
        Ze(), $.each(to[vo].children, function(e, t) {
            t.isVisible() && "undefined" != typeof t.attrs.id && Be(t)
        })
    }

    function He(e) {
        e.isVisible() && (processAndClearElement(e), Je(e), Be(e))
    }

    function Be(e) {
        var t = "",
            _ = "";
        if (t = e.attrs.id, -1 < t.indexOf("__")) switch (_ = t.substr(0, t.indexOf("__")), _) {
            case "pline":
                Ue(e);
                break;
            default:
        }
    }

    function Ze() {
        Rs[vo].destroyChildren()
    }

    function Je(e) {
        Qe({
            attr_name: "parent_id",
            attr_value: e.id()
        })
    }

    function Qe(e) {
        $.each(Rs[vo].children, function(t, _) {
            _.attrs[e.attr_name] == e.attr_value && _.hide()
        })
    }

    function Ue(e) {
        switch (e.attrs.pline_start) {
            case "empty":
                break;
            case "zavalc_in":
            case "zavalc_out":
                var t = e.points();
                et(t[0], t[1], t[2], t[3], e.attrs.pline_start_val, !0, e.attrs.pline_start, e.id(), "pline_start");
                break;
            default:
        }
        switch (e.attrs.pline_end) {
            case "empty":
                break;
            case "zavalc_in":
            case "zavalc_out":
                var t = e.points(),
                    _ = t.length;
                et(t[_ - 2], t[_ - 1], t[_ - 4], t[_ - 3], e.attrs.pline_end_val, !0, e.attrs.pline_end, e.id(), "pline_end");
                break;
            default:
        }
    }

    function et(e, t, _, a, r, n, s, o, i) {
        var l = calculateAngle(e, -1e4, e, t, _, a, !0, !0, !1),
            c = Ie(e, t, r, n, l),
            d = 0,
            p = 0,
            m = 0,
            h = 0;
        switch (s) {
            case "zavalc_in":
                switch (c.chetv) {
                    case "up":
                        d = -90, h = 0, p = -1.5, m = 0;
                        break;
                    case "down":
                        d = 90, h = 180, p = 1.5, m = 0;
                        break;
                    case "right":
                        d = 0, h = 90, p = 0, m = -1.5;
                        break;
                    case "left":
                        d = 180, h = -90, p = 0, m = 1.5;
                        break;
                    case "1":
                        d = l - 90, h = l, p = -1, m = -1;
                        break;
                    case "2":
                        d = l - 90, h = l, p = 1, m = -1;
                        break;
                    case "3":
                        d = 360 - Math.abs(l) - 90, h = 360 + l, p = 1, m = 1;
                        break;
                    case "4":
                        d = l - 90, h = 360 + l, p = -1, m = 1;
                }
                break;
            case "zavalc_out":
                switch (p = 1, m = 1, c.chetv) {
                    case "up":
                        d = 90, h = 0, p = 1.5, m = 0;
                        break;
                    case "down":
                        d = -90, h = 180, p = -1.5, m = 0;
                        break;
                    case "right":
                        d = 180, h = 90, p = 0, m = 1.5;
                        break;
                    case "left":
                        d = 0, h = -90, p = 0, m = -1.5;
                        break;
                    case "1":
                        d = l + 90, h = l, p = 1, m = 1;
                        break;
                    case "2":
                        d = -1 * (360 - l - 90), h = l, p = -1, m = 1;
                        break;
                    case "3":
                        d = l + 90, h = 360 + l, p = -1, m = -1;
                        break;
                    case "4":
                        d = l + 90, h = 360 + l, p = 1, m = -1;
                }
                break;
            default:
        }
        var u = Pe(c.points[0], c.points[1], c.points[2], c.points[3], 4, !1, d);
        displayDimensionLine(u.points[0], u.points[1], u.points[2], u.points[3], e + 500 * (-1 * p), t + 500 * (-1 * m), o, "", "", "", [], "", i, "", !1);
        var f = mainColors.default_element_color;
        "undefined" != typeof Zi && "undefined" !== Zi && Zi.id() == o && (f = mainColors.selected_element_color);
        var g = new Konva.Line({
                points: u.points,
                stroke: f,
                strokeWidth: 2,
                parent_id: o,
                visible: !0,
                object_visible: 1
            }),
            y = new Konva.Arc({
                x: e + 1 * p,
                y: t + 1 * m,
                innerRadius: 2,
                outerRadius: 2,
                angle: 190,
                rotation: h,
                fill: f,
                stroke: f,
                strokeWidth: 2,
                parent_id: o,
                clockwise: !1
            });
        Rs[vo].add(y), Rs[vo].add(g), to[vo].batchDraw()
    }

    /**
     * Обрабатывает все элементы на текущем слое, проверяя их видимость и вызывая обработку по типу.
     *
     * @param {Object} options - Объект с параметрами обработки.
     * @param {boolean} [options.CheckIsVisible=true] - Указывает, нужно ли проверять видимость элементов.
     */
    function processLayerElements(options) {
        var checkVisibility = true;

        // Проверяем, передан ли параметр CheckIsVisible, и обновляем значение
        if (typeof options.CheckIsVisible !== "undefined" && options.CheckIsVisible === false) {
            checkVisibility = false;
        }

        // Очищаем временные группы элементов
        nt();

        // Перебираем все дочерние элементы текущего слоя
        $.each(to[vo].children, function(index, element) {
            // Проверяем, нужно ли обрабатывать элемент
            var isObjectVisible = typeof element.attrs.is_object_visible === "undefined" || element.attrs.is_object_visible === 1;
            var isVisible = !checkVisibility || (checkVisibility && element.isVisible());
            var hasId = typeof element.attrs.id !== "undefined";

            // Если элемент удовлетворяет условиям, обрабатываем его по типу
            if (isObjectVisible && isVisible && hasId) {
                processElementByType(element);
            }
        });
    }

    /**
     * Находит элемент по его ID и выполняет очистку и обработку.
     *
     * @param {string} elementId - ID элемента, который нужно найти и обработать.
     */
    function processElementById(elementId) {
        // Находим элемент на сцене по его ID
        var element = Bi.findOne("#" + elementId);

        // Если элемент найден, выполняем его очистку и обработку
        if (element) {
            processAndClearElement(element);
        }
    }

    /**
     * Обрабатывает заданный элемент, очищая связанные данные и выполняя действия, зависящие от типа элемента.
     *
     * @param {Object} element - Элемент для обработки (например, Konva.Shape).
     */
    function processAndClearElement(element) {
        // Очищает связанные данные для элемента
        st(element);

        // Если элемент видим, обрабатывает его в зависимости от типа
        if (element.isVisible()) {
            processElementByType(element);
        }
    }

    /**
     * Обрабатывает элемент в зависимости от его типа.
     *
     * @param {Object} element - Объект элемента (например, Konva.Shape), который нужно обработать.
     */
    function processElementByType(element) {
        // Получаем ID элемента
        var elementId = element.attrs.id;

        // Проверяем, содержит ли ID разделитель "__"
        if (elementId.indexOf("__") > -1) {
            // Извлекаем тип элемента из ID
            var elementType = elementId.substr(0, elementId.indexOf("__"));

            // Выполняем действия в зависимости от типа элемента
            switch (elementType) {
                case "pline":
                    // Обработка полилинии
                    processPolylineSegments(element);
                    break;

                default:
                    // Для других типов элементов действия не определены
                    break;
            }
        }
    }

    function nt() {
        $s[vo].destroyChildren(), Es[vo].destroyChildren()
    }

    function st(e) {
        ot({
            attr_name: "parent_id",
            attr_value: e.id()
        });
        var t = Ct({
            filter_type: ["lineblock"],
            filter_parent_id: e.id(),
            filter_visible: "1"
        });
        $.each(t, function(e, t) {
            ot({
                attr_name: "parent_id",
                attr_value: t.id
            })
        })
    }

    function ot(e) {
        $.each($s[vo].children, function(t, _) {
            _.attrs[e.attr_name] == e.attr_value && _.hide()
        }), $.each(Es[vo].children, function(t, _) {
            _.attrs[e.attr_name] == e.attr_value && _.hide()
        })
    }

    function it(e) {
        var t = {};
        return $.each(e, function(e, _) {
            "undefined" == typeof t["s_" + _.parent_segment_num] && (t["s_" + _.parent_segment_num] = []), t["s_" + _.parent_segment_num].push(_)
        }), t
    }

    /**
     * Обрабатывает сегменты полилинии, добавляет размеры, углы и дополнительные элементы.
     *
     * @param {Object} polyline - Объект полилинии (Konva.Line), который нужно обработать.
     */
    function processPolylineSegments(polyline) {
        // Вычисляем центр масс полилинии
        var centerMass = Jt(polyline);

        // Получаем точки полилинии
        var points = polyline.points();
        var pointsCount = points.length;

        // Получаем связанные элементы (например, блоки линий)
        var relatedLineBlocks = Ct({
            filter_type: ["lineblock"],
            filter_parent_id: polyline.id(),
            filter_visible: "1"
        });

        // Группируем связанные элементы по сегментам
        relatedLineBlocks = it(relatedLineBlocks);

        // Счётчики для углов и сегментов
        var angleCounter = 0;
        var segmentCounter = 1;

        // Обрабатываем каждый сегмент полилинии
        for (var i = 0; i < (pointsCount - 2) / 2; i++) {
            var segmentType = "";
            var startDecoration = "";
            var endDecoration = "";

            // Определяем тип сегмента и декорации для начала и конца
            if (pointsCount === 4) {
                segmentType = "one_line_pline";
                switch (polyline.attrs.pline_start) {
                    case "zavalc_in":
                        startDecoration = "zavalc_in";
                        break;
                    case "zavalc_out":
                        startDecoration = "zavalc_out";
                        break;
                    default:
                        break;
                }
                switch (polyline.attrs.pline_end) {
                    case "zavalc_in":
                        endDecoration = "zavalc_in";
                        break;
                    case "zavalc_out":
                        endDecoration = "zavalc_out";
                        break;
                    default:
                        break;
                }
            } else if (i === 0) {
                segmentType = "first_line_pline";
                switch (polyline.attrs.pline_start) {
                    case "zavalc_in":
                        startDecoration = "zavalc_in";
                        break;
                    case "zavalc_out":
                        startDecoration = "zavalc_out";
                        break;
                    default:
                        break;
                }
            } else if (i === (pointsCount - 2) / 2 - 1) {
                segmentType = "last_line_pline";
                switch (polyline.attrs.pline_end) {
                    case "zavalc_in":
                        endDecoration = "zavalc_in";
                        break;
                    case "zavalc_out":
                        endDecoration = "zavalc_out";
                        break;
                    default:
                        break;
                }
            }

            // Длина сегмента (если доступна)
            var segmentLength = "";
            var lengthsArray = [];
            if (ei.type === "sznde") {
                lengthsArray = polyline.attrs.pline_lengths_ish;
                if (typeof lengthsArray[segmentCounter - 1] !== "undefined") {
                    segmentLength = lengthsArray[segmentCounter - 1] + "";
                }
            }

            // Проверка на разрывы сегментов
            var hasBreak = false;
            var breaks = {};
            if (ei.type === "sznde") {
                breaks = JSON.copy(polyline.attrs.pline_breaks);
                if (
                    typeof breaks["l" + (segmentCounter - 1)] !== "undefined" &&
                    Ei.includes(parseInt(breaks["l" + (segmentCounter - 1)]))
                ) {
                    hasBreak = true;
                }
            }

            // Добавляем сегмент с размерами и декорациями
            displayDimensionLine(
                points[2 * i + 0],
                points[2 * i + 1],
                points[2 * i + 2],
                points[2 * i + 3],
                centerMass.x_mass,
                centerMass.y_mass,
                polyline.id(),
                segmentType,
                startDecoration,
                endDecoration,
                relatedLineBlocks["s_" + i],
                segmentCounter,
                "",
                segmentLength,
                hasBreak
            );

            // Добавляем дугу угла между сегментами, если это не первый сегмент
            if (angleCounter > 0) {
                drawAngleArc(
                    points[2 * i - 2],
                    points[2 * i - 1],
                    points[2 * i + 0],
                    points[2 * i + 1],
                    points[2 * i + 2],
                    points[2 * i + 3],
                    polyline.id(),
                    angleCounter
                );
            }

            // Увеличиваем счётчики
            angleCounter++;
            segmentCounter++;
        }
    }

     /**
     * Рисует дугу угла между двумя линиями и отображает значение угла.
     *
     * @param {number} e - Координата X первой точки первой линии.
     * @param {number} t - Координата Y первой точки первой линии.
     * @param {number} _ - Координата X второй точки первой линии (общая точка).
     * @param {number} a - Координата Y второй точки первой линии (общая точка).
     * @param {number} r - Координата X второй точки второй линии.
     * @param {number} n - Координата Y второй точки второй линии.
     * @param {string} s - ID родительского элемента.
     * @param {number} o - Счётчик углов для уникальной идентификации.
     */
    function drawAngleArc(e, t, _, a, r, n, s, o) {
        var i = calculateAngle(e, t, _, a, r, n, !0, !0, !1),
            l = calculateAngle(_, -1e4, _, a, e, t, !0, !0, !1),
            c = 0;
        0 > i && (c = i);
        var d = new Konva.Arc({
            x: _,
            y: a,
            innerRadius: 20,
            outerRadius: 20,
            angle: Math.abs(i),
            rotation: -90 + l + c,
            fill: "#868686",
            stroke: "#868686",
            strokeWidth: 1,
            parent_id: s,
            clockwise: !1
        });
        $s[vo].add(d);
        var p = Math.abs(i),
            m = 45;
        90 < p && 110 >= p ? m = 55 : 110 < p && 130 >= p ? m = 75 : 130 < p && 150 >= p ? m = 120 : 150 < p && 160 >= p ? m = 200 : 160 < p && 170 >= p ? m = 450 : 170 < p && 180 >= p && (m = 700);
        var h = calculateAngle(_, -1e4, _, a, e, t, !0, !1, !1),
            u = De([_, a, e, t], m, 0, h),
            f = calculateAngle(_, -1e4, _, a, r, n, !0, !1, !1),
            g = De([_, a, r, n], m, 0, f),
            y = e + u.delta_x,
            b = t + u.delta_y,
            v = r + g.delta_x,
            x = n + g.delta_y;
        if (0 < parseInt(p.toFixed(2) / 1)) {
            var w = new Konva.Text({
                x: y + (v - y) / 2,
                y: b + (x - b) / 2,
                text: p.toFixed(2) / 1 + "\xB0",
                fontSize: 14,
                fontFamily: "Arial",
                fontStyle: "bold",
                rotation: 0,
                fill: "#333",
                draggable: y_("draggable_konva_text_angle"),
                parent_id: s,
                visible: !0,
                listening: y_("listening_konva_text_angle"),
                angle_num_counter: o
            });
            $s[vo].add(w)
        }
    }

   
    /**
     * Создаёт и отображает размерные линии и размеры для CAD элементов.
     * 
     * @param {number} startX - Начальная координата X линии элемента
     * @param {number} startY - Начальная координата Y линии элемента
     * @param {number} endX - Конечная координата X линии элемента
     * @param {number} endY - Конечная координата Y линии элемента
     * @param {number} massX - Координата X центра масс для определения направления размера
     * @param {number} massY - Координата Y центра масс для определения направления размера
     * @param {string} parentId - Идентификатор родительского элемента
     * @param {string} segmentType - Тип сегмента (например, "first_line_pline", "one_line_pline")
     * @param {string} startDecoration - Тип оформления начала линии (например, "zavalc_in", "zavalc_out")
     * @param {string} endDecoration - Тип оформления конца линии (например, "zavalc_in", "zavalc_out")
     * @param {Array} lineblocks - Массив блоков линий, связанных с сегментом
     * @param {number} segmentCounter - Счетчик сегмента для нумерации
     * @param {string} zavalcStartEnd - Параметр для обозначения типа завальцовки
     * @param {string} segmentLength - Длина сегмента (может быть передана как строка)
     * @param {boolean} hasBreak - Флаг наличия разрыва в линии
     */
    function displayDimensionLine(startX, startY, endX, endY, massX, massY, parentId, segmentType, startDecoration, endDecoration, lineblocks, segmentCounter, zavalcStartEnd, segmentLength, hasBreak) {
        // Базовое расстояние для размещения размерной линии от элемента
        var baseOffsetDistance = 25;
        // Флаг наличия связанных блоков линий
        var hasLineBlocks = false;
        // Количество связанных блоков линий
        var lineBlocksCount = 0;

        // Проверка наличия блоков линий и увеличение расстояния при необходимости
        if (typeof lineblocks !== "undefined" && lineblocks.length > 0) {
            lineBlocksCount = lineblocks.length;
            hasLineBlocks = true;
            // Увеличиваем расстояние для размерной линии с учетом количества блоков
            baseOffsetDistance += baseOffsetDistance * lineBlocksCount;
        }

        // Получаем координаты центра линии
        var centerPoint = Se(startX, startY, endX, endY);
        var centerX = centerPoint.line_center_x;
        var centerY = centerPoint.line_center_y;

        // Инициализация переменных для положения текста размера
        var textX = 0;
        var textY = 0;
        
        // Определяем квадрант расположения линии
        var quadrant = Ge(startX, startY, endX, endY);
        
        // Вычисляем угол линии
        var lineAngle = calculateAngle(startX, -10000, startX, startY, endX, endY, true, true, false);
        
        // Текст размера (длина сегмента)
        var dimensionText = "";
        
        // Если длина не передана, вычисляем её
        if (segmentLength === "") {
            // Вычисляем длину линии
            var lineLength = Te(startX, startY, endX, endY, false);
            // Форматируем длину в нужном формате
            dimensionText = ut((100 * lineLength / Go.g_scale[vo]).toFixed(yi.length.prec));
        } else {
            dimensionText = segmentLength;
        }

        // Коэффициенты направления для размерной линии
        var directionX = 1;
        var directionY = 1;
        var textRotation = lineAngle;
        var textOffsetX = 0;
        var textOffsetY = 0;

        // Округляем координаты для точности сравнения
        massY = +massY.toFixed(3);
        centerY = +centerY.toFixed(3);
        massX = +massX.toFixed(3);
        centerX = +centerX.toFixed(3);

        // Определяем положение размерной линии в зависимости от квадранта
        switch (quadrant) {
            case "1":
            case "3":
                // Определяем направление относительно центра масс для 1 и 3 квадрантов
                var directionIndicator = "";
                var slopeRatio = (massY - startY) / (endY - startY) - (massX - startX) / (endX - startX);
                
                slopeRatio = +slopeRatio.toFixed(3);
                
                if ((slopeRatio < 0 && quadrant === "1") || (slopeRatio > 0 && quadrant === "3")) {
                    directionIndicator = "up-left";
                } else if ((slopeRatio > 0 && quadrant === "1") || (slopeRatio < 0 && quadrant === "3")) {
                    directionIndicator = "down-right";
                } else if (Math.abs(slopeRatio) === 0) {
                    directionIndicator = "up-left";
                } else {
                    directionIndicator = "up-left";
                }
                
                // Настраиваем коэффициенты направления
                if (directionIndicator === "up-left") {
                    directionX = -1;
                    directionY = -1;
                    // Увеличиваем расстояние для размерной линии при наличии оформления краев
                    if (!hasLineBlocks && 
                    ((quadrant === "1" && (startDecoration === "zavalc_in" || endDecoration === "zavalc_out")) || 
                        (quadrant === "3" && (startDecoration === "zavalc_out" || endDecoration === "zavalc_in"))) && 
                        !y_("size_is_push_to_line")) {
                        baseOffsetDistance *= 2;
                    }
                } else if (directionIndicator === "down-right") {
                    directionX = 1;
                    directionY = 1;
                    // Увеличиваем расстояние для размерной линии при наличии оформления краев
                    if (!hasLineBlocks && 
                    ((quadrant === "1" && (startDecoration === "zavalc_out" || endDecoration === "zavalc_in")) ||
                        (quadrant === "3" && (startDecoration === "zavalc_in" || endDecoration === "zavalc_out"))) && 
                        !y_("size_is_push_to_line")) {
                        baseOffsetDistance *= 2;
                    }
                }
                
                // Вычисляем позицию текста
                textX = centerX + directionX * Math.abs(baseOffsetDistance * Math.sin((90 - lineAngle) * l["pi/180"]));
                textY = centerY + directionX * Math.abs(baseOffsetDistance * Math.cos((90 - lineAngle) * l["pi/180"]));
                
                // Настраиваем поворот текста
                if (lineAngle > 0) {
                    textRotation -= 90;
                } else {
                    textRotation += 90;
                }
                
                textOffsetX = -1;
                textOffsetY = -1;
                break;
                
            case "2":
            case "4":
                // Определяем направление относительно центра масс для 2 и 4 квадрантов
                var directionIndicator = "";
                var slopeRatio = (massY - startY) / (endY - startY) - (massX - startX) / (endX - startX);
                
                slopeRatio = +slopeRatio.toFixed(3);
                
                if ((slopeRatio < 0 && quadrant === "2") || (slopeRatio > 0 && quadrant === "4")) {
                    directionIndicator = "down-left";
                } else if ((slopeRatio > 0 && quadrant === "2") || (slopeRatio < 0 && quadrant === "4")) {
                    directionIndicator = "up-right";
                } else if (Math.abs(slopeRatio) === 0) {
                    directionIndicator = "up-right";
                } else {
                    directionIndicator = "up-right";
                }
                
                // Настраиваем коэффициенты направления
                if (directionIndicator === "up-right") {
                    directionX = 1;
                    directionY = -1;
                    // Увеличиваем расстояние для размерной линии при наличии оформления краев
                    if (!hasLineBlocks && 
                    ((quadrant === "2" && (startDecoration === "zavalc_in" || endDecoration === "zavalc_out")) || 
                        (quadrant === "4" && (startDecoration === "zavalc_out" || endDecoration === "zavalc_in"))) && 
                        !y_("size_is_push_to_line")) {
                        baseOffsetDistance *= 2;
                    }
                } else if (directionIndicator === "down-left") {
                    directionX = -1;
                    directionY = 1;
                    // Увеличиваем расстояние для размерной линии при наличии оформления краев
                    if (!hasLineBlocks && 
                    ((quadrant === "2" && (startDecoration === "zavalc_out" || endDecoration === "zavalc_in")) || 
                        (quadrant === "4" && (startDecoration === "zavalc_in" || endDecoration === "zavalc_out"))) && 
                        !y_("size_is_push_to_line")) {
                        baseOffsetDistance *= 2;
                    }
                }
                
                // Вычисляем позицию текста
                textX = centerX + directionX * Math.abs(baseOffsetDistance * Math.cos((180 - lineAngle) * l["pi/180"]));
                textY = centerY + directionY * Math.abs(baseOffsetDistance * Math.sin((180 - lineAngle) * l["pi/180"]));
                
                // Настраиваем поворот текста
                if (lineAngle > 0) {
                    textRotation -= 90;
                } else {
                    textRotation += 90;
                }
                
                textOffsetX = 1;
                textOffsetY = -1;
                break;
                
            case "up":
            case "down":
                // Вертикальные линии - вверх или вниз
                textY = centerY;
                
                if (massX < centerX) {
                    // Увеличиваем расстояние для размерной линии при наличии оформления краев
                    if (!hasLineBlocks && 
                    ((quadrant === "down" && (startDecoration === "zavalc_in" || endDecoration === "zavalc_out")) || 
                        (quadrant === "up" && (startDecoration === "zavalc_out" || endDecoration === "zavalc_in"))) && 
                        !y_("size_is_push_to_line")) {
                        baseOffsetDistance *= 2;
                    }
                    textX = centerX + baseOffsetDistance;
                } else {
                    // Увеличиваем расстояние для размерной линии при наличии оформления краев
                    if (!hasLineBlocks && 
                    ((quadrant === "down" && (startDecoration === "zavalc_out" || endDecoration === "zavalc_in")) || 
                        (quadrant === "up" && (startDecoration === "zavalc_in" || endDecoration === "zavalc_out"))) && 
                        !y_("size_is_push_to_line")) {
                        baseOffsetDistance *= 2;
                    }
                    textX = centerX - baseOffsetDistance;
                }
                
                textRotation = -90;
                textOffsetX = -1;
                textOffsetY = 0;
                break;
                
            case "left":
            case "right":
                // Горизонтальные линии - влево или вправо
                textX = centerX;
                
                if (massY < centerY) {
                    // Увеличиваем расстояние для размерной линии при наличии оформления краев
                    if (!hasLineBlocks && 
                    ((quadrant === "left" && (startDecoration === "zavalc_in" || endDecoration === "zavalc_out")) || 
                        (quadrant === "right" && (startDecoration === "zavalc_out" || endDecoration === "zavalc_in"))) && 
                        !y_("size_is_push_to_line")) {
                        baseOffsetDistance *= 2;
                    }
                    textY = centerY + baseOffsetDistance;
                } else {
                    // Увеличиваем расстояние для размерной линии при наличии оформления краев
                    if (!hasLineBlocks && 
                    ((quadrant === "left" && (startDecoration === "zavalc_out" || endDecoration === "zavalc_in")) || 
                        (quadrant === "right" && (startDecoration === "zavalc_in" || endDecoration === "zavalc_out"))) && 
                        !y_("size_is_push_to_line")) {
                        baseOffsetDistance *= 2;
                    }
                    textY = centerY - baseOffsetDistance;
                }
                
                textRotation = 0;
                textOffsetX = 0;
                textOffsetY = -1;
                break;
                
            default:
                // В непредвиденных случаях используем значения по умолчанию
        }

        // Расчет линий смещения для размерных линий с блоками
        var offsetX = textX - centerX;
        var offsetY = textY - centerY;
        // Коэффициенты для плавного распределения линий блоков
        var gradientOffsetX = 0.15 * offsetX / (lineBlocksCount + 1);
        var gradientOffsetY = 0.15 * offsetY / (lineBlocksCount + 1);

        // Если размеры привязаны к линии, создаём вспомогательные линии
        if (y_("size_is_vynos")) {
            // Создаем выносные линии
            mt(startX, startY, startX + offsetX + gradientOffsetX, startY + offsetY + gradientOffsetY, parentId);
            mt(endX, endY, endX + offsetX + gradientOffsetX, endY + offsetY + gradientOffsetY, parentId);
            mt(startX + offsetX, startY + offsetY, endX + offsetX, endY + offsetY, parentId);
        }
        
        // Если размеры привязаны к линии, отображаем размерный текст особым образом
        if (y_("size_is_push_to_line")) {
            // Параметры для отображения текста в привязке к линии
            var textPosX = 0;
            var textPosY = 0;
            var textOriginX = 0;
            var textOriginY = 0;
            // Масштаб смещения для обычных линий
            var normalScale = hasBreak ? 3 : 8;
            var breakScale = hasBreak ? 1.2 : 1.7;
            // Масштаб смещения для линий с разрывами
            var normalBreakScale = hasBreak ? 8 : 3;
            var breakBreakScale = hasBreak ? 1.2 : 1.7;

            // Определяем положение текста в зависимости от квадранта
            switch (quadrant) {
                case "1":
                case "3":
                    if (offsetX > 0) {
                        textPosX = centerX + (textX - centerX) / normalScale;
                        textPosY = centerY + (textY - centerY) / normalScale;
                        textOriginX = centerX - (textX - centerX) / 4 - 1;
                        textOriginY = centerY - (textY - centerY) / 4 - 1;
                    } else {
                        textPosX = centerX - (centerX - textX) / breakScale;
                        textPosY = centerY - (centerY - textY) / breakScale;
                        textOriginX = centerX - (centerX - textX) / 4 - 1;
                        textOriginY = centerY - (centerY - textY) / 4 - 1;
                    }
                    break;
                    
                case "2":
                case "4":
                    if (offsetX > 0) {
                        textPosX = centerX + (textX - centerX) / breakScale;
                        textPosY = centerY - (centerY - textY) / breakScale;
                        textOriginX = centerX + (textX - centerX) / 4 + 1;
                        textOriginY = centerY - (centerY - textY) / 4 - 1;
                    } else {
                        textPosX = centerX - (centerX - textX) / normalScale;
                        textPosY = centerY + (textY - centerY) / normalScale;
                        textOriginX = centerX + (centerX - textX) / 4 + 1;
                        textOriginY = centerY - (textY - centerY) / 4 - 1;
                    }
                    break;
                    
                case "up":
                case "down":
                    textPosY = centerY;
                    textOriginY = centerY;
                    
                    if (offsetX > 0) {
                        textPosX = centerX + normalBreakScale;
                        textOriginX = centerX - 8;
                    } else {
                        textPosX = centerX - (centerX - textX) / breakBreakScale;
                        textOriginX = centerX - 8;
                    }
                    break;
                    
                case "left":
                case "right":
                    textPosX = centerX;
                    textOriginX = centerX;
                    
                    if (offsetY > 0) {
                        textPosY = centerY + normalBreakScale;
                        textOriginY = centerY - 8;
                    } else {
                        textPosY = centerY - (centerY - textY) / breakBreakScale;
                        textOriginY = centerY - 8;
                    }
                    break;
                    
                default:
                    // В непредвиденных случаях используем значения по умолчанию
            }

            // Добавляем размерный текст, если длина больше нуля
            if (parseFloat(dimensionText) > 0) {
                displayDimensionText(textPosX, textOffsetX, textPosY, textOffsetY, dimensionText, textRotation, parentId, segmentCounter, zavalcStartEnd, hasBreak, textOriginX, textOriginY);
            }
        } else {
            // Стандартное отображение размерного текста
            if (parseFloat(dimensionText) > 0) {
                displayDimensionText(textX, textOffsetX, textY, textOffsetY, dimensionText, textRotation, parentId, segmentCounter, zavalcStartEnd, false, 0, 0);
            }
        }

        // Обработка блоков линий
        if (hasLineBlocks) {
            // Сортируем блоки линий по смещению
            lineblocks = pt(lineblocks);
            
            var blockCounter = 1;
            
            // Добавляем размеры для каждого блока линий
            $.each(lineblocks, function(index, block) {
                // Коэффициент распределения для текущего блока
                var ratio = blockCounter / (lineBlocksCount + 1);
                var blockOffsetX = offsetX * ratio;
                var blockOffsetY = offsetY * ratio;
                
                // Добавляем выносные линии и размеры для блока линии
                if (parseFloat(block.offset) > 0) {
                    // Создаём выносные линии для смещения блока
                    mt(block.points[0], block.points[1], block.points[0] + blockOffsetX + gradientOffsetX, block.points[1] + blockOffsetY + gradientOffsetY, block.id);
                    mt(startX + blockOffsetX, startY + blockOffsetY, block.points[0] + blockOffsetX, block.points[1] + blockOffsetY, block.id);
                    
                    // Добавляем размер для смещения блока
                    var offsetCenter = Se(startX + blockOffsetX, startY + blockOffsetY, block.points[0] + blockOffsetX, block.points[1] + blockOffsetY);
                    displayDimensionText(offsetCenter.line_center_x, textOffsetX, offsetCenter.line_center_y, textOffsetY, block.offset, textRotation, block.id, "", zavalcStartEnd, false, 0, 0);
                }
                
                // Создаём выносные линии для длины блока
                mt(block.points[2], block.points[3], block.points[2] + blockOffsetX + gradientOffsetX, block.points[3] + blockOffsetY + gradientOffsetY, block.id);
                mt(block.points[0] + blockOffsetX, block.points[1] + blockOffsetY, block.points[2] + blockOffsetX, block.points[3] + blockOffsetY, block.id);
                
                // Добавляем размер для длины блока
                var blockCenter = Se(block.points[0] + blockOffsetX, block.points[1] + blockOffsetY, block.points[2] + blockOffsetX, block.points[3] + blockOffsetY);
                displayDimensionText(blockCenter.line_center_x, textOffsetX, blockCenter.line_center_y, textOffsetY, block.length, textRotation, block.id, "", zavalcStartEnd, false, 0, 0);
                
                blockCounter++;
            });
        }
    }

    function pt(e) {
        return e.sort(function(e, t) {
            return parseInt(e.offset) - parseInt(t.offset)
        })
    }

    function mt(e, t, _, a, r) {
        var n = new Konva.Line({
            points: [e, t, _, a],
            stroke: "#868686",
            tension: 1,
            strokeWidth: 1,
            parent_id: r,
            visible: !0,
            object_visible: 1
        });
        $s[vo].add(n)
    }

    /**
     * Создаёт и отображает текст с размерами элемента на CAD-чертеже.
     * 
     * @param {number} x - Координата X для размещения текста
     * @param {number} xOffset - Смещение по X относительно координаты
     * @param {number} y - Координата Y для размещения текста
     * @param {number} yOffset - Смещение по Y относительно координаты
     * @param {string} text - Текстовое содержимое (обычно размер элемента)
     * @param {number} rotation - Угол поворота текста в градусах
     * @param {string} parentId - ID родительского элемента
     * @param {string|number} lineCounter - Порядковый номер или идентификатор линии
     * @param {string} zavalcStartEnd - Параметр для обозначения типа завальцовки
     * @param {boolean} hasBreak - Флаг наличия разрыва в линии
     * @param {number} breakX - Координата X для разрыва линии 
     * @param {number} breakY - Координата Y для разрыва линии
     */
    function displayDimensionText(x, xOffset, y, yOffset, text, rotation, parentId, lineCounter, zavalcStartEnd, hasBreak, breakX, breakY) {
        // Если указан номер линии и включено отображение номера линии в настройках, добавляем его к тексту
        if (lineCounter !== "" && y_("size_text_is_line_counter")) {
            text += " (" + lineCounter + ")";
        }
        
        // Создаем текстовый объект размера
        var dimensionText = new Konva.Text({
            x: x + 12 * xOffset,
            y: y + 12 * yOffset,
            text: text,
            fontSize: 14,
            fontFamily: "Arial",
            fontStyle: "bold",
            rotation: rotation,
            fill: "#333",
            draggable: y_("draggable_konva_text_line_length"), // Возможность перетаскивания из настроек
            parent_id: parentId,
            visible: true,
            line_num_counter: lineCounter,
            listening: y_("listening_konva_text_line_length"), // Реагирование на события мыши из настроек
            zavalc_start_end: zavalcStartEnd,
        });     

        // Добавляем обработчики событий для линии подсветки
        dimensionText.on("mouseenter", function(e) {
            if ("undefined" === Zi) {
                gs()
            }
            
            highlightPolylineSegment(
                e.evt.layerX,
                e.evt.layerY,
                Zi.attrs.points,
                Zi.attrs.id
            );
        });        

        dimensionText.on("click", function(e) {
            handleSegmentSelection(e); // Обработчик выбора сегмента
        });

        // Добавляем текстовый объект в текущий слой размеров
        $s[vo].add(dimensionText);

        // Если указан разрыв линии, добавляем соответствующий индикатор
        if (hasBreak) {
            // Создаем метку для обозначения разрыва
            var breakLabel = new Konva.Label({
                x: breakX,
                y: breakY,
                opacity: 1,
                draggable: false,
                rotation: rotation,
                visible: true,
                listening: false,
                parent_id: parentId
            });

            // Добавляем фон для метки
            var breakLabelTag = new Konva.Tag({
                fill: "#fff",
                parent_id: parentId
            });

            // Создаем текст для обозначения разрыва
            var breakText = new Konva.Text({
                text: "⁠⁠", // Специальный символ для обозначения разрыва
                fontSize: 17,
                fontFamily: "Arial",
                fontStyle: "bold",
                rotation: 0,
                fill: "#000",
                draggable: false,
                parent_id: parentId,
                visible: true,
                padding: -1,
                listening: false
            });

            // Устанавливаем межбуквенный интервал
            breakText.letterSpacing(-2);

            // Добавляем компоненты к метке разрыва
            breakLabel.add(breakLabelTag);
            breakLabel.add(breakText);

            // Добавляем метку разрыва на слой разрывов
            Es[vo].add(breakLabel);
        }
    }

    function ut(e) {
        if (-1 < e.indexOf(".")) {
            for (;
                "0" == e.substr(e.length - 1, 1);) e = e.substr(0, e.length - 1);
            for (;
                "." == e.substr(e.length - 1, 1);) e = e.substr(0, e.length - 1)
        }
        return e
    }

    function ft() {
        ie();
        to[vo].toImage({
            callback: function(e) {
                $("#modal_save_appendblock").html(e), showModalWindow("save", {})
            }
        });
        "undefined" != typeof yaCounter43809814 && yaCounter43809814.reachGoal("action_save_click"), !1
    }

    function gt(e) {
        var t = !0;
        "undefined" != typeof e.CheckIsVisible && !1 == e.CheckIsVisible && (t = !1), Hs[vo].destroyChildren(), $.each(to[vo].children, function(e, _) {
            ("undefined" == typeof _.attrs.is_object_visible || 1 == _.attrs.is_object_visible) && (!1 == t || t && _.isVisible()) && "undefined" != typeof _.attrs.id && vt(_, !1)
        })
    }

    function yt(e, t) {
        var _ = Bi.findOne("#" + e);
        vt(_, t)
    }

    function bt(e) {
        for (var t = Hs[vo].children.length, _ = t - 1, a; 0 <= _; _--) a = Hs[vo].children[_], a.attrs.parent_id == e && a.destroy()
    }

    function vt(e, t) {
        switch (bt(e.id()), e.className) {
            case "Line":
                var _ = e.points();
                t && (_ = _.slice(0, _.length - 2));
                for (var a = _.length, r = 0, n; r < a / 2; r++) n = {
                    x: _[2 * r + 0],
                    y: _[2 * r + 1],
                    parent_id: e.id()
                }, xt(n);
                break;
            default:
        }
    }

    function xt(e) {
        var t = new Konva.Rect({
            x: e.x - 5,
            y: e.y - 5,
            width: 10,
            height: 10,
            stroke: mainColors.selected_element_color,
            strokeWidth: 2,
            id: "obsnap_" + ko,
            parent_id: e.parent_id,
            visible: !0,
            opacity: 0,
            hitFunc: function(e) {
                e.beginPath(), e.rect(-10, -10, 30, 30), e.closePath(), e.fillStrokeShape(this)
            }
        });
        t.on("mousemove", function(e) {
            zt(e)
        }), t.on("mouseenter", function(e) {
            wt(e)
        }), t.on("mouseleave", function(e) {
            kt(e)
        }), t.on("click", function(e) {
            jt(e)
        }), ko++, Hs[vo].add(t)
    }

    function wt(e) {
        switch (Oo.mode) {
            case "add_element":
                e.target.opacity(1), Fl = e.target.x() + 5, Al = e.target.y() + 5, to[vo].draw();
                break;
            default:
        }
    }

    function kt(e) {
        e.target.opacity(0), Fl = "", Al = "", to[vo].draw()
    }

    function zt(e) {
        handleCanvasMouseMove(e)
    }

    function jt(e) {
        ye(e)
    }

    function Ct(e) {
        var t = "";
        t = "undefined" == typeof e.layer_name ? vo : e.layer_name, "undefined" == typeof e.limit && (e.limit = -1);
        var _ = [],
            a = !1;
        if ("undefined" != typeof e.what && (a = !0, "*" == e.what && (a = !1)), $.each(to[t].children, function(r, n) {
                if (0 > e.limit || 0 < e.limit && e.limit > _.length) {
                    var s = "";
                    if (s = n.attrs.id, "undefined" != typeof s && "undefined" != s && -1 < s.indexOf("__") && At(e, n.isVisible()) && Ot(e, s) && Ft(e, n)) {
                        var o = s.substr(0, s.indexOf("__"));
                        switch (n.className) {
                            case "Line":
                                if (Lt(e, o)) switch (o) {
                                    case "pline":
                                    case "line":
                                        if (!a || a && -1 < e.what.indexOf("pline_points")) {
                                            var l = n.points(),
                                                c = l.length,
                                                d = 0,
                                                p = 0;
                                            if (!a || a && -1 < e.what.indexOf("pline_lengths"))
                                                for (var m = [], h = 0; h < (c - 2) / 2; h++) d = Te(l[2 * p + 0], l[2 * p + 1], l[2 * p + 2], l[2 * p + 3], !1), d = ut((100 * d / Go.g_scale[vo]).toFixed(yi.length.prec)), m.push(d), p++;
                                            if (!a || a && -1 < e.what.indexOf("pline_angles")) {
                                                var u = [];
                                                p = 0;
                                                for (var f = 0, h = 0; h < (c - 2) / 2; h++) 0 == p && (f = calculateAngle(l[0], -1e4, l[0], l[1], l[2], l[3], !0, !0, !1), f = ut(f.toFixed(2)), u.push(f)), p + 2 < c / 2 && (f = calculateAngle(l[2 * p + 0], l[2 * p + 1], l[2 * p + 2], l[2 * p + 3], l[2 * p + 4], l[2 * p + 5], !0, !0, !1), f = ut(f.toFixed(2)), u.push(f)), p++
                                            }
                                        }
                                        if (!a || a && -1 < e.what.indexOf("pline_lineblocks")) {
                                            var g = [];
                                            g = Ct({
                                                filter_type: ["lineblock"],
                                                filter_parent_id: n.id(),
                                                filter_visible: "1"
                                            })
                                        }
                                        var y = {
                                            e_id_pref: o
                                        };
                                        if ((!a || a && -1 < e.what.indexOf("pline_type")) && (y.type = o), (!a || a && -1 < e.what.indexOf("pline_name")) && (y.name = n.name()), (!a || a && -1 < e.what.indexOf("pline_is_object_visible")) && ("undefined" == typeof n.attrs.is_object_visible && (n.attrs.is_object_visible = 1), y.is_object_visible = n.attrs.is_object_visible), (!a || a && -1 < e.what.indexOf("pline_id")) && (y.id = n.id()), (!a || a && -1 < e.what.indexOf("pline_points")) && (y.points = l), (!a || a && -1 < e.what.indexOf("pline_points_x_y")) && (y.points_x = [], y.points_y = [], "undefined" != typeof y.points))
                                            for (var h = 0; h < y.points.length; h++) h % 2 ? y.points_y.push(y.points[h]) : y.points_x.push(y.points[h]);
                                        (!a || a && -1 < e.what.indexOf("pline_lengths")) && (y.lengths = m), (!a || a && -1 < e.what.indexOf("pline_angles")) && (y.angles = u), (!a || a && -1 < e.what.indexOf("pline_lineblocks")) && (y.lineblocks = g), (!a || a && -1 < e.what.indexOf("pline_tab_num")) && (y.tab_num = parseInt(t.replace("layer_", ""))), (!a || a && -1 < e.what.indexOf("offset_origin")) && ("undefined" == typeof n.attrs.offset_origin ? y.offset_origin = {
                                            x: 0,
                                            y: 0
                                        } : y.offset_origin = n.attrs.offset_origin), "pline" == o && ((!a || a && -1 < e.what.indexOf("pline_start_end")) && (y.line_start = n.attrs.pline_start, y.line_start_val = n.attrs.pline_start_val, y.line_end = n.attrs.pline_end, y.line_end_val = n.attrs.pline_end_val), (!a || a && -1 < e.what.indexOf("pline_is_closed")) && (isPolylineClosed(l) ? y.is_closed = 1 : y.is_closed = 0), (!a || a && -1 < e.what.indexOf("pline_roof_calc")) && (y.overalls = G_(l), y.points_local = D_(l, y.overalls, !0), y.overalls_local = X_(y.overalls)), (!a || a && -1 < e.what.indexOf("pline_columns_sheets")) && "undefined" != typeof n.attrs.columns_sheets && (y.columns_sheets = n.attrs.columns_sheets), (!a || a && -1 < e.what.indexOf("pline_columns_sheets_specification")) && "undefined" != typeof n.attrs.columns_sheets && (y.columns_sheets_specification = ia(n.attrs.columns_sheets)), (!a || a && -1 < e.what.indexOf("pline_scale")) && (y.is_closed ? y.scale = Rt(l) : y.scale = 0), (!a || a && -1 < e.what.indexOf("pline_scale_sheets_full")) && (y.scale_sheets_full = 0, "undefined" != typeof y.columns_sheets_specification && ($.each(y.columns_sheets_specification, function(e, t) {
                                            y.scale_sheets_full += 1e6 * t.quantity
                                        }), y.scale_sheets_full /= 1e6)), (!a || a && -1 < e.what.indexOf("pline_scale_sheets_useful")) && (y.scale_sheets_useful = 0, "undefined" != typeof y.columns_sheets_specification && ($.each(y.columns_sheets_specification, function(e, t) {
                                            y.scale_sheets_useful += 1e6 * t.quantity_useful
                                        }), y.scale_sheets_useful /= 1e6)), (!a || a && -1 < e.what.indexOf("pline_scale_sheets_waste")) && (y.scale_sheets_waste = 0, "undefined" != typeof y.scale && "undefined" != typeof y.scale_sheets_useful && 0 != y.scale_sheets_useful && (y.scale_sheets_waste = 100 - 100 * (y.scale / y.scale_sheets_useful))), (!a || a && -1 < e.what.indexOf("pline_slope_length")) && (y.slope_length = 0, "undefined" != typeof y.overalls_local && (y.slope_length = y.overalls_local.y_max - y.overalls_local.y_min)));
                                        var b = !0;
                                        if ("undefined" != typeof e.filter_with_columns_sheets && "1" == e.filter_with_columns_sheets && "undefined" == typeof y.columns_sheets && (b = !1), "undefined" != typeof e.filter_with_columns_sheets_specification && "1" == e.filter_with_columns_sheets_specification && "undefined" == typeof y.columns_sheets_specification && (b = !1), "undefined" != typeof e.filter_without_columns_sheets && "1" == e.filter_without_columns_sheets && "undefined" != typeof y.columns_sheets && 0 < y.columns_sheets.length && (b = !1), "undefined" != typeof e.filter_is_object_visible && "1" == e.filter_is_object_visible && "undefined" != typeof y.is_object_visible && 0 == y.is_object_visible && (b = !1), "undefined" != typeof e.filter_is_closed && "1" == e.filter_is_closed && "undefined" != typeof y.is_closed && 0 == y.is_closed && (b = !1), "undefined" != typeof e.filter_with_point_in_polygon) {
                                            var v = {
                                                x_min: y.overalls.x_min,
                                                x_max: y.overalls.x_max,
                                                y_min: y.overalls.y_min,
                                                y_max: y.overalls.y_max,
                                                points_x: y.points_x,
                                                points_y: y.points_y
                                            };
                                            on(v, e.filter_with_point_in_polygon.x, e.filter_with_point_in_polygon.y) || (b = !1)
                                        }
                                        b && _.push(y);
                                        break;
                                    case "lineblock":
                                        var y = {
                                            type: o,
                                            name: n.name(),
                                            id: n.id(),
                                            parent_id: n.attrs.parent_id,
                                            offset: n.attrs.lb_offset,
                                            length: n.attrs.lb_length,
                                            parent_segment_num: n.attrs.parent_segment_num,
                                            lineblock_type: n.attrs.type.replace("lineblock_", ""),
                                            points: n.points()
                                        };
                                        _.push(y);
                                        break;
                                    default:
                                }
                                break;
                            case "Text":
                                if (Lt(e, o)) {
                                    var y = {
                                        id: n.id(),
                                        name: n.name(),
                                        text: n.attrs.text,
                                        is_visible: n.isVisible() ? 1 : 0,
                                        x0_length: 100 * (n.attrs.x - Fo[vo]) / Go.g_scale[vo],
                                        y0_length: 100 * (Ao[vo] - n.attrs.y) / Go.g_scale[vo]
                                    };
                                    _.push(y)
                                }
                                break;
                            default:
                        }
                    }
                }
            }), (!a || a && -1 < e.what.indexOf("pline_scale_without_cuts")) && 0 < _.length) {
            var r = [],
                n = !1;
            if (_[0].scale_without_cuts = "undefined" == typeof _[0].scale ? 0 : _[0].scale, 1 == _.length ? "undefined" != typeof _[0].columns_sheets && "undefined" != typeof e.is_pline_scale_without_cuts_get_elements && e.is_pline_scale_without_cuts_get_elements && (r = Ct({
                    layer_name: t,
                    filter_type: ["pline"],
                    filter_is_object_visible: "1",
                    filter_without_columns_sheets: "1",
                    what: ["*"]
                }), n = !0) : 1 < _.length && (r = _.slice(1), n = !0), n && 0 < r.length && "undefined" != typeof _[0].scale && "undefined" != typeof _[0].points && "undefined" != typeof _[0].overalls && "undefined" != typeof _[0].points_x && "undefined" != typeof _[0].points_y) {
                for (var s = 0, o = "", l = !1, c = !1, d = !1, p = 0, m; p < r.length; p++)
                    if ("undefined" != typeof r[p].scale && 0 < r[p].scale && "undefined" != typeof r[p].points) switch (m = {
                            polygon_main: {
                                x_min: _[0].overalls.x_min,
                                x_max: _[0].overalls.x_max,
                                y_min: _[0].overalls.y_min,
                                y_max: _[0].overalls.y_max,
                                points_x: _[0].points_x,
                                points_y: _[0].points_y
                            },
                            polygon_compare: {
                                points: r[p].points
                            }
                        }, o = sn(m), o.status) {
                        case "all_points_in_polygon":
                        case "points_in_out_polygon":
                            s += r[p].scale, l = !0;
                            break;
                        case "all_points_out_polygon":
                            c = !0, d = !0;
                            break;
                        default:
                    }
                c || d ? $("#roofstat_s_slope_d_prop_name_text_info").show() : $("#roofstat_s_slope_d_prop_name_text_info").hide(), _[0].scale_without_cuts = _[0].scale - s, _[0].scale_sheets_waste = 100 - 100 * (_[0].scale_without_cuts / _[0].scale_sheets_useful)
            }
        }
        if ("undefined" != typeof e.order_by && "" != e.order_by && "undefined" != typeof e.order_as && "" != e.order_as) switch (e.order_as) {
            case "ASC":
                _.sort(function(t, _) {
                    return t[e.order_by] - _[e.order_by]
                });
                break;
            case "DESC":
                _.sort(function(t, _) {
                    return _[e.order_by] - t[e.order_by]
                });
                break;
            default:
        }
        return "undefined" != typeof e.limit_ && 0 < e.limit_ && (_ = _.slice(0, e.limit_)), _
    }

    function Lt(e, t) {
        if ("undefined" == typeof e) return !0;
        if ("undefined" == typeof e.filter_type) return !0;
        var _ = !1;
        return $.each(e.filter_type, function(e, a) {
            a == t && (_ = !0)
        }), _
    }

    function Ot(e, t) {
        return !("undefined" != typeof e) || "undefined" == typeof e.filter_id || e.filter_id == t
    }

    function Ft(e, t) {
        return !("undefined" != typeof e) || "undefined" == typeof e.filter_parent_id || "undefined" != typeof t.attrs.parent_id && e.filter_parent_id == t.attrs.parent_id
    }

    function At(e, t) {
        return !("undefined" != typeof e) || "undefined" == typeof e.filter_visible || "1" == e.filter_visible && !0 == t || "0" == e.filter_visible
    }

    function qt(e, t) {
        var _ = {
            name: e.lineblock_name,
            length: U(e.lineblock_length),
            offset: U(e.lineblock_offset),
            type: e.lineblock_type,
            parent_id: t.lineblock_params.pi,
            parent_segment_num: t.lineblock_params.sn
        };
        Pt(_), $("#modal_html").modal("hide")
    }

    function Tt(e) {
        $.each(to[vo].children, function(t, _) {
            switch (_.className) {
                case "Line":
                    var a = _.id();
                    if ("undefined" != typeof a && -1 < a.indexOf("__")) {
                        var r = a.substr(0, a.indexOf("__"));
                        switch (r) {
                            case "lineblock":
                                _.attrs.parent_id == e && St(_.id());
                                break;
                            default:
                        }
                    }
                    break;
                default:
            }
        })
    }

    function St(e) {
        var t = Bi.findOne("#" + e),
            _ = Ct({
                filter_id: t.attrs.parent_id,
                what: ["pline_points"]
            });
        _ = _[0];
        var a = {},
            r = t.attrs.lb_length;
        a.offset = t.attrs.lb_offset, a.parent_segment_num = t.attrs.parent_segment_num;
        var n = _.points,
            s = n[2 * parseInt(a.parent_segment_num) + 0],
            o = n[2 * parseInt(a.parent_segment_num) + 1],
            i = !0,
            l = calculateAngle(n[2 * parseInt(a.parent_segment_num) + 0], -1e4, n[2 * parseInt(a.parent_segment_num) + 0], n[2 * parseInt(a.parent_segment_num) + 1], n[2 * parseInt(a.parent_segment_num) + 2], n[2 * parseInt(a.parent_segment_num) + 3], !0, !0, !1),
            c = Ie(s, o, r, i, l);
        c = Pe(c.points[0], c.points[1], c.points[2], c.points[3], a.offset, i, l), t.setAttrs({
            points: c.points
        })
    }

    function Pt(e) {
        var t = Ct({
            filter_id: e.parent_id,
            what: ["pline_points"]
        });
        t = t[0];
        var _ = t.points,
            a = _[2 * parseInt(e.parent_segment_num) + 0],
            r = _[2 * parseInt(e.parent_segment_num) + 1],
            n = e.length,
            o = !0,
            i = calculateAngle(_[2 * parseInt(e.parent_segment_num) + 0], -1e4, _[2 * parseInt(e.parent_segment_num) + 0], _[2 * parseInt(e.parent_segment_num) + 1], _[2 * parseInt(e.parent_segment_num) + 2], _[2 * parseInt(e.parent_segment_num) + 3], !0, !0, !1),
            l = Ie(a, r, n, o, i);
        l = Pe(l.points[0], l.points[1], l.points[2], l.points[3], e.offset, o, i), incrementCounter();
        var c = new Konva.Line({
            points: l.points,
            stroke: mainColors.lineblock_color,
            strokeWidth: 4,
            id: "lineblock__" + xo,
            draggable: !1,
            name: e.name,
            type: e.type,
            parent_id: e.parent_id,
            parent_segment_num: e.parent_segment_num,
            lb_offset: e.offset,
            lb_length: e.length,
            object_visible: 1
        });
        c.on("click", function(e) {
            handleElementClick(e, "lineblock")
        }), c.on("mousemove", function(e) {
            handleMouseMove(e)
        }), to[vo].add(c), I({
            "data-element": "lineblock",
            id: c.id(),
            name: e.name
        }), processElementById(e.parent_id), vt(c, !1);
        var d = Bi.findOne("#" + e.parent_id);
        He(d), to[vo].draw()
    }

    function It(e) {
        ql && (Yt(e), Xt(e), K("form", {
            form_id: e
        }))
    }

    function Yt(e) {
        ql = !1, $("#" + e).parent().find(".form__loading").show()
    }

    function Dt(e) {
        ql = !0, $("#" + e).parent().find(".form__loading").hide()
    }

    function Xt(e) {
        $("#" + e).find(".gl_form_err_ul").empty(), $("#" + e).find(".f-has-error").removeClass("f-has-error")
    }

    function Gt(e) {
        switch (e.type) {
            case "mch":
            case "mch_modul":
            case "pn":
            case "falc":
                Hi.roof_new_form.inputs.roof_new_gap_y.label = "\u041F\u0435\u0440\u0435\u043A\u0440\u044B\u0442\u0438\u0435 \u0437\u0430\u043C\u043A\u043E\u0432\u043E\u0435", Hi.roof_new_form.inputs.roof_new_gap_y.is_more_zero = !0, Hi.roof_new_form.inputs.roof_new_gap_y.is_more_equal_zero = !1;
                break;
            case "siding":
            case "siding_vert":
                Hi.roof_new_form.inputs.roof_new_gap_y.label = "\u041D\u0430\u0445\u043B\u0451\u0441\u0442", Hi.roof_new_form.inputs.roof_new_gap_y.is_more_zero = !1, Hi.roof_new_form.inputs.roof_new_gap_y.is_more_equal_zero = !0;
                break;
            default:
        }
        "block" == $("#roof_new_type_reassign").css("display") && "block" == $("#roof_new_offset_run").css("display") && -1 != ["siding", "siding_vert"].indexOf($("#roof_new_type_reassign").val()) ? "siding_vert" == $("#roof_new_type_reassign").val() ? Hi.roof_new_form.inputs.roof_new_offset_run = {
            label: "\u0420\u0430\u0437\u0431\u0435\u0436\u043A\u0430",
            is_check_as_int: !0,
            is_more_zero: !1,
            is_more_equal_zero: !0,
            is_more_equal_zero_message: "<b>\u0420\u0430\u0437\u0431\u0435\u0436\u043A\u0430</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u0430 \u043D\u0443\u043B\u044E."
        } : Hi.roof_new_form.inputs.roof_new_offset_run = {
            label: "\u0420\u0430\u0437\u0431\u0435\u0436\u043A\u0430",
            is_check_as_int: !0,
            value_must_be: 0,
            value_must_be_message: "<b>\u0420\u0430\u0437\u0431\u0435\u0436\u043A\u0430</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0440\u0430\u0432\u043D\u0430 \u043D\u0443\u043B\u044E."
        } : (Hi.roof_new_form.inputs.roof_new_offset_run = {
            label: "\u0420\u0430\u0437\u0431\u0435\u0436\u043A\u0430",
            is_check_as_int: !0,
            is_more_zero: !0,
            is_more_zero_message: "<b>\u0420\u0430\u0437\u0431\u0435\u0436\u043A\u0430</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0443\u043B\u044F.",
            is_more_zero_if_id_visible: "roof_new_offset_run"
        }, "falc" == e.type && (Hi.roof_new_form.inputs.roof_new_offset_run.value_must_be_more_equal = 500, Hi.roof_new_form.inputs.roof_new_offset_run.value_must_be_more_equal_message = "<b>\u0420\u0430\u0437\u0431\u0435\u0436\u043A\u0430 \u0434\u043B\u044F \u0444\u0430\u043B\u044C\u0446\u0430</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u0430 500."))
    }

    function Wt(e, t) {
        ai.errors = [], Xt(e);
        var _ = $("#" + e).serializeArray();
        if (_ = Nt(_), Kt(e, _, t), 0 < ai.errors.length) {
            var a = "";
            $.each(ai.errors, function(e, t) {
                a += "<li>" + t + "</li>"
            }), $("#" + e).find(".gl_form_err_ul").append(a)
        }
    }

    function Kt(e, t, _) {
        if ("undefined" != typeof Hi[e]) {
            var a = !1;
            "undefined" != typeof Hi[e].is_more_zero_all && Hi[e].is_more_zero_all && (a = !0), $.each(Hi[e].inputs, function(e, r) {
                ("undefined" == typeof t[e] || "" == t[e].toString()) && ai.errors.push("\u0423\u043A\u0430\u0436\u0438\u0442\u0435 <b>" + r.label + "</b>."), "undefined" != typeof r.is_check_as_int && r.is_check_as_int && (t[e] = parseInt(U(t[e]))), (a || "undefined" != typeof r.is_more_zero && r.is_more_zero) && ("undefined" == typeof r.is_more_zero_if_id_visible || "undefined" != typeof r.is_more_zero_if_id_visible && "block" == $("#" + r.is_more_zero_if_id_visible).css("display")) && 0 >= t[e] && ("undefined" == typeof r.is_more_zero_message ? "undefined" == typeof r.label ? ai.errors.push("<b>" + e + "</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0443\u043B\u044F.") : ai.errors.push("<b>" + r.label + "</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0443\u043B\u044F.") : ai.errors.push(r.is_more_zero_message), ai.error_ids.push(_ + e)), "undefined" != typeof r.is_more_equal_zero && r.is_more_equal_zero && 0 > t[e] && ("undefined" == typeof r.is_more_equal_zero_message ? "undefined" == typeof r.label ? ai.errors.push("<b>" + e + "</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u043E \u043D\u0443\u043B\u044E.") : ai.errors.push("<b>" + r.label + "</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u043E \u043D\u0443\u043B\u044E.") : ai.errors.push(r.is_more_equal_zero_message), ai.error_ids.push(_ + e)), "undefined" != typeof r.value_must_be && t[e] != r.value_must_be && ai.errors.push(r.value_must_be_message), "undefined" != typeof r.value_must_be_more_equal && t[e] < r.value_must_be_more_equal && ai.errors.push(r.value_must_be_more_equal_message)
            })
        } else ai.errors.push("\u041D\u0435 \u0437\u0430\u0434\u0430\u043D\u0430 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0444\u043E\u0440\u043C\u044B (#1)");
        switch (e) {
            case "roof_new_form":
                var r = [];
                switch (t.roof_new_mode) {
                    case "new":
                        r = Ho.sheet_allowed_length_full;
                        break;
                    case "settings":
                        r = "undefined" == typeof Ho.nom_id_1c ? Mo.sheet_allowed_length_full : Ho.sheet_allowed_length_full;
                        break;
                    default:
                }
                var n = r[0],
                    s = r[r.length - 1];
                t.roof_new_sheet_allowed_length_correct_max < t.roof_new_sheet_allowed_length_correct_min && ai.errors.push("<b>\u0414\u043B\u0438\u043D\u0430 max</b> \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u043C\u0435\u043D\u044C\u0448\u0435 <b>\u0414\u043B\u0438\u043D\u0430 min</b>."), 0 > t.roof_new_sheet_allowed_length_correct_min && ai.errors.push("<b>\u0414\u043B\u0438\u043D\u0430 min</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0443\u043B\u044F."), t.roof_new_sheet_allowed_length_correct_max > s && ai.errors.push("<b>\u0414\u043B\u0438\u043D\u0430 max</b> \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C " + s + "."), t.roof_new_sheet_allowed_length_correct_max < n && ai.errors.push("<b>\u0414\u043B\u0438\u043D\u0430 max</b> \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u043C\u0435\u043D\u044C\u0448\u0435 " + n + "."), t.roof_new_sheet_allowed_length_correct_min > s && ai.errors.push("<b>\u0414\u043B\u0438\u043D\u0430 min</b> \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C " + s + "."), t.roof_new_sheet_allowed_length_correct_min < n && ai.errors.push("<b>\u0414\u043B\u0438\u043D\u0430 min</b> \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u043C\u0435\u043D\u044C\u0448\u0435 " + n + ".");
                var o = $("#sheet_allowed_length_text_edit_cells").find(".selected"),
                    i = 0;
                0 < o.length && $.each(o, function(e, _) {
                    i = parseInt($(_)[0].attributes["data-l"].value), (i < t.roof_new_sheet_allowed_length_correct_min || i > t.roof_new_sheet_allowed_length_correct_max) && ai.errors.push("\u0412\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u0440\u0430\u0437\u043C\u0435\u0440 <b>" + i / 1e3 + "</b> \u043D\u0435 \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u043C\u0435\u0436\u0434\u0443 <b>\u0414\u043B\u0438\u043D\u0430 min</b> \u0438 <b>\u0414\u043B\u0438\u043D\u0430 max</b>.")
                });
                break;
            default:
        }
    }

    function Nt(e) {
        var t = {};
        return $.each(e, function(e, _) {
            var a = _.name; - 1 < a.indexOf("[arr][]") || -1 < a.indexOf("[ids][]") ? (-1 < a.indexOf("[arr][]") ? a = a.replace("[arr][]", "") : -1 < a.indexOf("[ids][]") && (a = a.replace("[ids][]", "")), "undefined" == typeof t[a] && (t[a] = []), t[a].push(_.value)) : t[_.name] = _.value
        }), t
    }

    function Vt(e, t) {
        return form_inputs = {}, $.each($("#" + e + " input"), function(e, _) {
            var a = $(_)[0].attributes.id.value,
                r = a.replace(t, "");
            form_inputs[r] = $(_).hasClass("js_cad_chb_elem") ? $(_).prop("checked") ? 1 : 0 : $(_).hasClass("js_cad_inp_mb_minus") ? U($(_)[0].value) : Math.abs(U($(_)[0].value))
        }), form_inputs
    }

    function $t(e) {
        for (var t = -1, _ = 0, a = 0, r = 0, n = {}, s = 0; s < e.length; s += 2) _ = Math.dist(e[s], e[s + 1], Fo[vo], Ao[vo]), (0 > t || _ < t) && (t = _, r = a), a++;
        return n = {
            point_num: r,
            x: e[2 * r],
            y: e[2 * r + 1]
        }, n
    }

    /**
     * Проверяет, является ли полилиния замкнутой.
     *
     * @param {Array} points - Массив координат точек полилинии в формате [x1, y1, x2, y2, ...].
     * @returns {boolean} - Возвращает `true`, если полилиния замкнута, иначе `false`.
     */
    function isPolylineClosed(points) {
        var totalPoints = points.length;

        // Вычисляем расстояние между первой и последней точками
        var distance = Math.dist(points[0], points[1], points[totalPoints - 2], points[totalPoints - 1]);

        // Если расстояние меньше 0.05, полилиния считается замкнутой
        return distance <= 0.05;
    }

    function Mt(e, t) {
        return [t[2 * e + 0], t[2 * e + 1], t[2 * e + 2], t[2 * e + 3]]
    }

    function Rt(e) {
        var t = 0,
            _ = 0,
            a = 0,
            r = 0,
            n = 0,
            o = e.length;
        o -= 2;
        for (var l = 0; l < o / 2; l++) _ = e[2 * l + 0], a = e[2 * l + 1], r = e[2 * l + 2], n = e[2 * l + 3], l == o / 2 - 1 && (r = e[0], n = e[1]), t += (_ + r) * (n - a);
        return t = 100 * (100 * t / Go.g_scale[vo]) / Go.g_scale[vo], t /= 2, t = Math.abs(t), t
    }

    function Ht(e, t) {
        var _ = {
                x: 0,
                y: 0
            },
            a = {
                target_rect_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_triangle_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_triangle_2_form: {
                    x: t.offset_x - t.b,
                    y: t.offset_y
                },
                target_trapec_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_paragramm_form: {
                    x: t.offset_x - Math.sqrt(t.b * t.b - t.h * t.h),
                    y: t.offset_y
                },
                target_trapec_2_form: {
                    x: t.offset_x - (t.c - t.a),
                    y: t.offset_y
                },
                target_trapec_6_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_trapec_7_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_trapec_8_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_gun_3_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_air_ex_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_porch_form: {
                    x: t.offset_x - t.a,
                    y: t.offset_y
                },
                target_home_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_home_2_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_hill_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_nest_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_nest_2_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_corner_form: {
                    x: t.offset_x - (t.c - t.a),
                    y: t.offset_y
                },
                target_trapec_3_form: {
                    x: t.offset_x - t.a1,
                    y: t.offset_y
                },
                target_hill_2_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_corner_2_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_gun_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_gun_2_form: {
                    x: t.offset_x - (t.d - t.a),
                    y: t.offset_y
                },
                target_goose_form: {
                    x: t.offset_x - (t.d - t.a),
                    y: t.offset_y
                },
                target_home_4_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_nest_3_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_hill_3_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_hill_4_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_nest_4_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_home_3_form: {
                    x: t.offset_x - t.c,
                    y: t.offset_y
                },
                target_horn_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_vase_form: {
                    x: t.offset_x - (t.d - t.a) / 2,
                    y: t.offset_y
                },
                target_triangle_3_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_triangle_4_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_triangle_5_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_trapec_4_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_trapec_5_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_train_1_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_train_2_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_paragramm_2_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_paragramm_3_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_wigwam_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_tank_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_tank_2_form: {
                    x: t.offset_x - t.a2,
                    y: t.offset_y
                },
                target_ftable_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_hill_5_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_hill_6_form: {
                    x: t.offset_x,
                    y: t.offset_y
                },
                target_nest_5_form: {
                    x: t.offset_x,
                    y: t.offset_y
                }
            },
            r = {
                target_rect_form: {
                    width: t.a,
                    height: t.b
                },
                target_trapec_form: {
                    width: t.a,
                    height: t.h
                },
                target_trapec_3_form: {
                    width: t.c,
                    height: t.h
                },
                target_paragramm_form: {
                    width: t.a + Math.sqrt(t.b * t.b - t.h * t.h),
                    height: t.h
                },
                target_trapec_2_form: {
                    width: t.c,
                    height: t.d
                },
                target_trapec_6_form: {
                    width: t.a,
                    height: t.d
                },
                target_trapec_7_form: {
                    width: t.a,
                    height: t.b
                },
                target_trapec_8_form: {
                    width: t.a,
                    height: t.b
                },
                target_gun_3_form: {
                    width: t.a + t.c,
                    height: t.b + t.d
                },
                target_triangle_form: {
                    width: t.a,
                    height: t.h
                },
                target_triangle_3_form: {
                    width: t.a,
                    height: t.c
                },
                target_triangle_4_form: {
                    width: t.a,
                    height: t.b
                },
                target_triangle_2_form: {
                    width: t.b,
                    height: t.c
                },
                target_triangle_5_form: {
                    width: t.b,
                    height: t.a
                },
                target_home_4_form: {
                    width: t.a,
                    height: t.h
                },
                target_home_2_form: {
                    width: t.a,
                    height: t.h
                },
                target_home_form: {
                    width: t.a,
                    height: t.h
                },
                target_porch_form: {
                    width: t.c,
                    height: t.b + t.h
                },
                target_vase_form: {
                    width: t.c,
                    height: t.h
                },
                target_nest_form: {
                    width: t.c,
                    height: t.b
                },
                target_nest_2_form: {
                    width: t.a + t.l + t.e,
                    height: t.h
                },
                target_nest_3_form: {
                    width: t.a + t.a + t.e,
                    height: t.h
                },
                target_nest_4_form: {
                    width: t.a + t.j + t.e,
                    height: t.L
                },
                target_home_3_form: {
                    width: t.L,
                    height: t.H
                },
                target_corner_form: {
                    width: t.c,
                    height: t.d
                },
                target_goose_form: {
                    width: t.d,
                    height: t.e
                },
                target_gun_form: {
                    width: t.c,
                    height: t.b
                },
                target_gun_2_form: {
                    width: t.d,
                    height: t.e
                },
                target_corner_2_form: {
                    width: t.a,
                    height: t.d
                },
                target_hill_form: {
                    width: t.a,
                    height: t.d
                },
                target_hill_3_form: {
                    width: t.a,
                    height: t.h1
                },
                target_hill_4_form: {
                    width: t.a,
                    height: t.h1
                },
                target_hill_2_form: {
                    width: t.a,
                    height: t.c
                },
                target_air_ex_form: {
                    width: t.a,
                    height: t.d
                },
                target_horn_form: {
                    width: t.a,
                    height: t.h
                },
                target_trapec_5_form: {
                    width: t.a1 + t.c,
                    height: t.h
                },
                target_trapec_4_form: {
                    width: t.a1 + t.e,
                    height: t.h
                },
                target_train_1_form: {
                    width: t.c,
                    height: t.b
                },
                target_train_2_form: {
                    width: t.e,
                    height: t.f
                },
                target_paragramm_3_form: {
                    width: t.a + Math.sqrt(t.e * t.e - t.h * t.h),
                    height: t.h
                },
                target_paragramm_2_form: {
                    width: t.a,
                    height: t.h,
                    if_right: Math.sqrt(t.e * t.e - t.h * t.h)
                },
                target_wigwam_form: {
                    width: t.a + t.b + t.c,
                    height: t.h
                },
                target_tank_form: {
                    width: t.a + t.a2,
                    height: t.h1
                },
                target_tank_2_form: {
                    width: t.a + t.a2,
                    height: t.h1
                },
                target_ftable_form: {
                    width: t.c,
                    height: t.b
                },
                target_hill_5_form: {
                    width: t.a + t.b + t.c,
                    height: t.h2 + t.h3
                },
                target_hill_6_form: {
                    width: t.a,
                    height: t.h1
                },
                target_nest_5_form: {
                    width: t.c,
                    height: t.b
                }
            };
        if (0 == t.offset_axes && (_ = {
                x: a[e].x,
                y: a[e].y
            }), "relatively_element" == Eo && "" != zi) {
            var n = Ct({
                filter_id: zi,
                what: ["pline_points", "pline_points_x_y", "pline_id", "is_object_visible", "pline_is_closed", "pline_scale", "pline_roof_calc", "offset_origin"]
            });
            if (1 == n.length) {
                var s = 0,
                    o = 0;
                switch (t.direction) {
                    case "right":
                        s = nn(n[0].overalls_local.x_max - n[0].overalls_local.x_min), "undefined" != typeof r[e].if_right && (s += r[e].if_right), _ = {
                            x: n[0].offset_origin.x + s + t.delta,
                            y: n[0].offset_origin.y
                        };
                        break;
                    case "up":
                        o = nn(n[0].overalls_local.y_max - n[0].overalls_local.y_min), _ = {
                            x: n[0].offset_origin.x,
                            y: n[0].offset_origin.y + o + t.delta
                        };
                        break;
                    case "left":
                        s = r[e].width, _ = {
                            x: n[0].offset_origin.x - s - t.delta,
                            y: n[0].offset_origin.y
                        };
                        break;
                    case "down":
                        o = r[e].height, _ = {
                            x: n[0].offset_origin.x,
                            y: n[0].offset_origin.y - o - t.delta
                        };
                        break;
                    default:
                }
            }
            zi = "", Zi = "undefined"
        }
        switch (e) {
            case "target_rect_form":
            case "rect":
                var i = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    c = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    d = i.points[0],
                    m = i.points[1],
                    h = i.points[2],
                    u = i.points[3],
                    f = c.points[2],
                    g = c.points[3],
                    y = createPolyline({
                        points: [d, m, h, u, h, g, d, g, d, m],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_triangle_form":
            case "triangle":
                var b = Ie(Fo[vo], Ao[vo], Math.abs(t.a1), !0, 90),
                    v, x;
                0 > t.a1 ? (v = Ie(Fo[vo] + Math.abs(b.delta_x), Ao[vo], t.a, !0, 90), x = Ie(Fo[vo], Ao[vo], t.h, !0, 0)) : (v = Ie(Fo[vo], Ao[vo], t.a, !0, 90), x = Ie(b.points[2], Ao[vo], t.h, !0, 0));
                var w = v.points[0],
                    k = v.points[1],
                    z = v.points[2],
                    j = v.points[3],
                    C = x.points[2],
                    L = x.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_triangle_2_form":
            case "triangle_2":
                var i = Ie(Fo[vo], Ao[vo], t.b, !0, 90),
                    c = Ie(Fo[vo], Ao[vo], t.c, !0, 0),
                    O = i.points[2],
                    F = i.points[3],
                    A = c.points[2],
                    q = c.points[3],
                    y = createPolyline({
                        points: [O, F, A, q, O, q, O, F],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_trapec_form":
            case "trapec":
                var i = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    T = Ie(Fo[vo], Ao[vo], t.a1, !0, 90),
                    x = Ie(T.points[2], T.points[3], t.h, !0, 0),
                    S = Ie(x.points[2], x.points[3], t.c, !0, 90),
                    d = i.points[0],
                    m = i.points[1],
                    h = i.points[2],
                    u = i.points[3],
                    P = x.points[2],
                    I = x.points[3],
                    Y = S.points[2],
                    D = S.points[3],
                    y = createPolyline({
                        points: [d, m, h, u, Y, D, P, I, d, m],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_paragramm_form":
            case "paragramm":
                var X = Math.acos(t.h / t.b);
                X *= l["180/pi"];
                var i = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    x = Ie(Fo[vo], Ao[vo], t.h, !0, 0),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, -X),
                    W = Fo[vo] - G.points[2],
                    d = i.points[0] + W,
                    m = i.points[1],
                    h = i.points[2] + W,
                    u = i.points[3],
                    K = G.points[2] + W,
                    N = G.points[3],
                    Y = G.points[2] + W + (h - d),
                    D = N,
                    y = createPolyline({
                        points: [d, m, h, u, Y, D, K, N, d, m],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_trapec_2_form":
            case "trapec_2":
                var V = Ie(Fo[vo], Ao[vo], t.c - t.a, !0, 90),
                    i = Ie(Fo[vo], Ao[vo], t.c, !0, 90),
                    E = Ie(Fo[vo], Ao[vo], t.d, !0, 0),
                    O = V.points[2],
                    F = V.points[3],
                    M = i.points[2],
                    R = i.points[3],
                    H = E.points[3],
                    Y = V.points[0],
                    D = H,
                    y = createPolyline({
                        points: [M, R, O, F, Y, D, M, H, M, R],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_trapec_6_form":
            case "trapec_6":
                var B = Ie(Fo[vo], Ao[vo], t.a - t.c, !0, 90),
                    v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    Z = Ie(Fo[vo], Ao[vo], t.d, !0, 0),
                    w = v.points[0],
                    k = v.points[1],
                    z = v.points[2],
                    j = v.points[3],
                    C = v.points[2],
                    L = Z.points[3],
                    J = B.points[2],
                    Q = Z.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_trapec_7_form":
            case "trapec_7":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    S = Ie(Fo[vo], Ao[vo], t.c, !0, 90),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = G.points[2],
                    L = G.points[3],
                    J = S.points[2],
                    Q = G.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_trapec_8_form":
            case "trapec_8":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    S = Ie(Fo[vo], Ao[vo], t.c, !0, 90),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = v.points[0],
                    L = G.points[3],
                    J = S.points[2],
                    Q = G.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_gun_3_form":
            case "gun_3":
                t["a+c"] = t.a + t.c, t["b+d"] = t.b + t.d, t["a+c-e"] = t["a+c"] - t.e;
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    U = Ie(Fo[vo], Ao[vo], t["a+c"], !0, 90),
                    ee = Ie(Fo[vo], Ao[vo], t["a+c-e"], !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    te = Ie(Fo[vo], Ao[vo], t["b+d"], !0, 0),
                    w = v.points[0],
                    k = v.points[1],
                    z = v.points[2],
                    j = v.points[3],
                    C = v.points[2],
                    L = G.points[3],
                    J = U.points[2],
                    Q = G.points[3],
                    _e = U.points[2],
                    ae = te.points[3],
                    re = ee.points[2],
                    ne = te.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_air_ex_form":
            case "air_ex":
                t.a1 = (t.a - t.c) / 2;
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    se = Ie(Fo[vo], Ao[vo], t.a1, !0, 90),
                    Z = Ie(se.points[2], Ao[vo], t.d, !0, 0),
                    G = Ie(se.points[2], Ao[vo], t.b, !0, 0),
                    S = Ie(Z.points[2], Z.points[3], t.c, !0, 90),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = G.points[2],
                    L = G.points[3],
                    J = Z.points[2],
                    Q = Z.points[3],
                    _e = S.points[2],
                    ae = S.points[3],
                    re = S.points[2],
                    ne = G.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_porch_form":
            case "porch":
                var se = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    oe = Ie(se.points[2], Ao[vo], t.g, !0, 90),
                    ie = Ie(oe.points[2], Ao[vo], t.e, !0, 90),
                    le = Ie(Fo[vo], Ao[vo], t.h, !0, 0),
                    G = Ie(Fo[vo], le.points[3], t.b, !0, 0),
                    S = Ie(Fo[vo], G.points[3], t.c, !0, 90),
                    w = se.points[2],
                    k = le.points[3],
                    z = se.points[0],
                    j = le.points[3],
                    C = G.points[2],
                    L = G.points[3],
                    J = S.points[2],
                    Q = S.points[3],
                    _e = ie.points[2],
                    ae = le.points[3],
                    re = oe.points[2],
                    ne = le.points[3],
                    ce = oe.points[2],
                    de = oe.points[3],
                    pe = oe.points[0],
                    me = oe.points[1],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, ce, de, pe, me, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_home_form":
            case "home":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    he = v.points[2] - (v.points[2] - v.points[0]) / 2,
                    x = Ie(he, Ao[vo], t.h, !0, 0),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = G.points[2],
                    L = G.points[3],
                    J = x.points[2],
                    Q = x.points[3],
                    _e = v.points[2],
                    ae = G.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_home_2_form":
            case "home_2":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    x = Ie(Fo[vo], Ao[vo], t.h, !0, 0),
                    T = Ie(Fo[vo], Ao[vo], (t.a - t.d) / 2, !0, 90),
                    Z = Ie(T.points[2], x.points[3], t.d, !0, 90),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = G.points[2],
                    L = G.points[3],
                    J = T.points[2],
                    Q = x.points[3],
                    _e = Z.points[2],
                    ae = Z.points[3],
                    re = v.points[2],
                    ne = G.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_hill_form":
            case "hill":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    Z = Ie(Fo[vo], Ao[vo], t.d, !0, 0),
                    ue = Ie(Fo[vo], Ao[vo], t.a - t.e, !0, 90),
                    fe = Ie(Fo[vo], Ao[vo], t.a - t.c, !0, 90),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = ue.points[2],
                    L = Z.points[3],
                    J = fe.points[2],
                    Q = G.points[3],
                    _e = v.points[2],
                    ae = G.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_nest_form":
            case "nest":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    S = Ie(Fo[vo], G.points[3], t.c, !0, 90),
                    ge = Ie(S.points[2], Ao[vo], t.e, !0, -90),
                    ye = t.b - t.h,
                    be = Math.sqrt(t.g * t.g - ye * ye),
                    T = Ie(v.points[2], Ao[vo], be, !0, 90),
                    x = Ie(T.points[2], G.points[3], t.h, !0, 180),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = G.points[2],
                    L = G.points[3],
                    J = S.points[2],
                    Q = S.points[3],
                    _e = ge.points[0],
                    ae = ge.points[1],
                    re = ge.points[2],
                    ne = ge.points[3],
                    ce = x.points[2],
                    de = x.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, ce, de, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_nest_2_form":
            case "nest_2":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    ve = Ie(v.points[2], Ao[vo], t.l, !0, 90),
                    ge = Ie(ve.points[2], Ao[vo], t.e, !0, 90),
                    T = Ie(Fo[vo], Ao[vo], t.a1, !0, 90),
                    xe = Ie(T.points[2], Ao[vo], t.h, !0, 0),
                    S = Ie(xe.points[2], xe.points[3], t.c, !0, 90),
                    we = (t.l + t.g + t.f) / 2;
                t.lgf_h = 2 * Math.sqrt(we * (we - t.l) * (we - t.g) * (we - t.f)) / t.l, t.g_kat_x = Math.sqrt(t.g * t.g - t.lgf_h * t.lgf_h);
                var p = Ie(v.points[2], Ao[vo], t.g_kat_x, !0, 90),
                    ke = Ie(p.points[2], Ao[vo], t.lgf_h, !0, 0),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = xe.points[2],
                    L = xe.points[3],
                    J = S.points[2],
                    Q = S.points[3],
                    _e = ge.points[2],
                    ae = ge.points[3],
                    re = ge.points[0],
                    ne = ge.points[1],
                    ce = ke.points[2],
                    de = ke.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, ce, de, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_corner_form":
            case "corner":
                t["c-a"] = t.c - t.a, t["d-b"] = t.d - t.b;
                var ze = Ie(Fo[vo], Ao[vo], t["c-a"], !0, 90),
                    v = Ie(ze.points[2], Ao[vo], t.a, !0, 90),
                    je = Ie(Fo[vo], Ao[vo], t["d-b"], !0, 0),
                    G = Ie(Fo[vo], je.points[3], t.b, !0, 0),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = v.points[0],
                    L = je.points[3],
                    J = ze.points[0],
                    Q = je.points[3],
                    _e = G.points[2],
                    ae = G.points[3],
                    re = v.points[2],
                    ne = G.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_trapec_3_form":
            case "trapec_3":
                var T = Ie(Fo[vo], Ao[vo], t.a1, !0, 90),
                    v = Ie(T.points[2], Ao[vo], t.a, !0, 90),
                    x = Ie(Fo[vo], Ao[vo], t.h, !0, 0),
                    S = Ie(Fo[vo], x.points[3], t.c, !0, 90),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = x.points[2],
                    L = x.points[3],
                    J = S.points[2],
                    Q = S.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_hill_2_form":
            case "hill_2":
                var G = Ie(Fo[vo], Ao[vo], t.b, !0, 90),
                    Ce = Ie(Fo[vo], Ao[vo], t.f, !0, 90),
                    v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    ge = Ie(Fo[vo], Ao[vo], t.e, !0, 0),
                    S = Ie(Fo[vo], Ao[vo], t.c, !0, 0),
                    Z = Ie(G.points[2], Ao[vo], t.d, !0, 90),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = G.points[2],
                    L = ge.points[3],
                    J = Z.points[2],
                    Q = ge.points[3],
                    _e = Ce.points[2],
                    ae = S.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_corner_2_form":
            case "corner_2":
                t["a-c"] = t.a - t.c, t["d-b"] = t.d - t.b;
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    Le = Ie(Fo[vo], G.points[3], t["a-c"], !0, 90),
                    je = Ie(Le.points[2], Le.points[3], t["d-b"], !0, 0),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = G.points[2],
                    L = G.points[3],
                    J = Le.points[2],
                    Q = Le.points[3],
                    _e = je.points[2],
                    ae = je.points[3],
                    re = w,
                    ne = ae,
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_gun_form":
            case "gun":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    S = Ie(G.points[2], G.points[3], t.c, !0, 90),
                    Z = Ie(S.points[2], S.points[3], t.d, !0, 180),
                    ge = Ie(Z.points[2], Z.points[3], t.e, !0, -90),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = G.points[2],
                    L = G.points[3],
                    J = S.points[2],
                    Q = S.points[3],
                    _e = Z.points[2],
                    ae = Z.points[3],
                    re = ge.points[2],
                    ne = ge.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_gun_2_form":
            case "gun_2":
                t["d-a"] = t.d - t.a;
                var Oe = Ie(Fo[vo], Ao[vo], t["d-a"], !0, 90),
                    v = Ie(Oe.points[2], Oe.points[3], t.a, !0, 90),
                    ge = Ie(v.points[2], v.points[3], t.e, !0, 0),
                    Z = Ie(ge.points[2], ge.points[3], t.d, !0, -90),
                    S = Ie(Z.points[2], Z.points[3], t.c, !0, 180),
                    G = Ie(S.points[2], S.points[3], t.b, !0, 90),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = G.points[2],
                    L = G.points[3],
                    J = G.points[0],
                    Q = G.points[1],
                    _e = S.points[0],
                    ae = S.points[1],
                    re = Z.points[0],
                    ne = Z.points[1],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_goose_form":
            case "goose":
                t["d-a"] = t.d - t.a;
                var Oe = Ie(Fo[vo], Ao[vo], t["d-a"], !0, 90),
                    v = Ie(Oe.points[2], Oe.points[3], t.a, !0, 90),
                    ge = Ie(v.points[2], v.points[3], t.e, !0, 0),
                    Z = Ie(ge.points[2], ge.points[3], t.d, !0, -90),
                    G = Ie(v.points[0], v.points[1], t.b, !0, 0),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = G.points[2],
                    L = G.points[3],
                    J = Z.points[2],
                    Q = Z.points[3],
                    _e = ge.points[2],
                    ae = ge.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_home_4_form":
            case "home_4":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    Fe = Ie(Fo[vo], Ao[vo], t.a / 2, !0, 90),
                    T = Ie(Fo[vo], Ao[vo], t.a1, !0, 90),
                    Ae = Ie(Fo[vo], Ao[vo], t.a - t.a1, !0, 90),
                    x = Ie(Fe.points[2], Fe.points[3], t.h, !0, 0),
                    qe = Ie(T.points[2], T.points[3], t.h1, !0, 0),
                    Te = Ie(Ae.points[2], Ae.points[3], t.h1, !0, 0),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = qe.points[2],
                    L = qe.points[3],
                    J = x.points[2],
                    Q = x.points[3],
                    _e = Te.points[2],
                    ae = Te.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_nest_3_form":
            case "nest_3":
                t["05_e"] = t.e / 2, t.a_05_e = t.a + t["05_e"], t.a_e = t.a + t.e, t["05_c"] = t.c / 2, t.c_left = t.a_05_e - t["05_c"], t.a_05_e_05c = t.a_05_e + t["05_c"], t.hor = 2 * t.a + t.e, t.h2 = Math.sqrt(t.d * t.d - t["05_e"] * t["05_e"]);
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    x = Ie(Fo[vo], Ao[vo], t.h, !0, 0),
                    Se = Ie(Fo[vo], Ao[vo], t.c_left, !0, 90),
                    Pe = Ie(Fo[vo], Ao[vo], t.a_05_e_05c, !0, 90),
                    i = Ie(Fo[vo], Ao[vo], t.hor, !0, 90),
                    Ye = Ie(Fo[vo], Ao[vo], t.a_e, !0, 90),
                    De = Ie(Fo[vo], Ao[vo], t.a_05_e, !0, 90),
                    Xe = Ie(Fo[vo], Ao[vo], t.h2, !0, 0),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = G.points[2],
                    L = G.points[3],
                    J = Se.points[2],
                    Q = x.points[3],
                    _e = Pe.points[2],
                    ae = x.points[3],
                    re = i.points[2],
                    ne = G.points[3],
                    ce = i.points[2],
                    de = i.points[3],
                    pe = Ye.points[2],
                    me = Ye.points[3],
                    Ge = De.points[2],
                    We = Xe.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, ce, de, pe, me, Ge, We, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_hill_3_form":
            case "hill_3":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    Ke = Ie(Fo[vo], Ao[vo], t.L, !0, 90),
                    Ne = Ie(Fo[vo], Ao[vo], t.L + t.b, !0, 90),
                    Ve = Ie(Fo[vo], Ao[vo], t.L + t.b + t.L1, !0, 90),
                    $e = Ie(Fo[vo], Ao[vo], t.L + t.b + t.L1 + t.c, !0, 90),
                    qe = Ie(Fo[vo], Ao[vo], t.h1, !0, 0),
                    Xe = Ie(Fo[vo], Ao[vo], t.h2, !0, 0),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = Ke.points[2],
                    L = qe.points[3],
                    J = Ne.points[2],
                    Q = qe.points[3],
                    _e = Ve.points[2],
                    ae = Xe.points[3],
                    re = $e.points[2],
                    ne = Xe.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_hill_4_form":
            case "hill_4":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    Ee = Ie(Fo[vo], Ao[vo], t.a - t.L, !0, 90),
                    Me = Ie(Fo[vo], Ao[vo], t.a - t.L - t.b, !0, 90),
                    Re = Ie(Fo[vo], Ao[vo], t.a - t.L - t.b - t.L1, !0, 90),
                    He = Ie(Fo[vo], Ao[vo], t.L2, !0, 90),
                    qe = Ie(Fo[vo], Ao[vo], t.h1, !0, 0),
                    Xe = Ie(Fo[vo], Ao[vo], t.h2, !0, 0),
                    w = v.points[0],
                    k = v.points[1],
                    z = v.points[2],
                    j = v.points[3],
                    C = Ee.points[2],
                    L = qe.points[3],
                    J = Me.points[2],
                    Q = qe.points[3],
                    _e = Re.points[2],
                    ae = Xe.points[3],
                    re = He.points[2],
                    ne = Xe.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_nest_4_form":
            case "nest_4":
                t["05_j"] = t.j / 2;
                var T = Ie(Fo[vo], Ao[vo], t.a1, !0, 90),
                    v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    Be = Ie(Fo[vo], Ao[vo], t.a + t["05_j"], !0, 90),
                    Ze = Ie(Fo[vo], Ao[vo], t.a + t.j, !0, 90),
                    Je = Ie(Fo[vo], Ao[vo], t.a + t.j + t.e, !0, 90),
                    Ke = Ie(Fo[vo], Ao[vo], t.L, !0, 0),
                    Qe = Ie(Fo[vo], Ao[vo], t.a1 + t.c, !0, 90),
                    Ce = Ie(Fo[vo], Ao[vo], t.f, !0, 0),
                    Ue = Ie(Fo[vo], Ao[vo], t.L1, !0, 0),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = T.points[2],
                    L = Ke.points[3],
                    J = Qe.points[2],
                    Q = Ke.points[3],
                    _e = Je.points[2],
                    ae = Je.points[3],
                    re = Ze.points[2],
                    ne = Ze.points[3],
                    ce = Ze.points[2],
                    de = Ce.points[3],
                    pe = Be.points[2],
                    me = Ue.points[3],
                    Ge = v.points[2],
                    We = Ce.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, ce, de, pe, me, Ge, We, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_home_3_form":
            case "home_3":
                t["a/2"] = t.a / 2;
                var S = Ie(Fo[vo], Ao[vo], t.c, !0, 90),
                    et = Ie(Fo[vo], Ao[vo], t.c + t["a/2"], !0, 90),
                    tt = Ie(Fo[vo], Ao[vo], t.c + t.a, !0, 90),
                    _t = Ie(Fo[vo], Ao[vo], t.c + t.a + t.f, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    at = Ie(Fo[vo], Ao[vo], t.H, !0, 0),
                    w = tt.points[2],
                    k = tt.points[3],
                    z = S.points[2],
                    j = S.points[3],
                    C = S.points[2],
                    L = G.points[3],
                    J = G.points[2],
                    Q = G.points[3],
                    _e = et.points[2],
                    ae = at.points[3],
                    re = _t.points[2],
                    ne = G.points[3],
                    ce = tt.points[2],
                    de = G.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, ce, de, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_horn_form":
            case "horn":
                t["a/2"] = t.a / 2, t["b/2"] = t.b / 2, t["a/2-b/2"] = t["a/2"] - t["b/2"], t["a/2+b/2"] = t["a/2"] + t["b/2"];
                var rt = Ie(Fo[vo], Ao[vo], t["a/2-b/2"], !0, 90),
                    nt = Ie(Fo[vo], Ao[vo], t["a/2+b/2"], !0, 90),
                    v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    qe = Ie(Fo[vo], Ao[vo], t.h1, !0, 0),
                    x = Ie(Fo[vo], Ao[vo], t.h, !0, 0),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = rt.points[2],
                    L = x.points[3],
                    J = rt.points[2],
                    Q = qe.points[3],
                    _e = nt.points[2],
                    ae = qe.points[3],
                    re = nt.points[2],
                    ne = x.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_vase_form":
            case "vase":
                t["(c-b)/2"] = (t.c - t.b) / 2, t["(c-a)/2"] = (t.c - t.a) / 2, t.h1 = Math.sqrt(t.d * t.d - t["(c-a)/2"] * t["(c-a)/2"]);
                var st = Ie(Fo[vo], Ao[vo], t["(c-b)/2"], !0, 90),
                    ot = Ie(Fo[vo], Ao[vo], t["(c-b)/2"] + t.b, !0, 90),
                    it = Ie(Fo[vo], Ao[vo], t["(c-a)/2"], !0, 90),
                    lt = Ie(Fo[vo], Ao[vo], t["(c-a)/2"] + t.a, !0, 90),
                    S = Ie(Fo[vo], Ao[vo], t.c, !0, 90),
                    qe = Ie(Fo[vo], Ao[vo], t.h1, !0, 0),
                    x = Ie(Fo[vo], Ao[vo], t.h, !0, 0),
                    w = lt.points[2],
                    k = lt.points[3],
                    z = it.points[2],
                    j = it.points[3],
                    C = qe.points[2],
                    L = qe.points[3],
                    J = st.points[2],
                    Q = x.points[3],
                    _e = ot.points[2],
                    ae = x.points[3],
                    re = S.points[2],
                    ne = qe.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_triangle_3_form":
            case "triangle_3":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    S = Ie(Fo[vo], Ao[vo], t.c, !0, 0),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = v.points[2],
                    L = S.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_triangle_4_form":
            case "triangle_4":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = G.points[2],
                    L = G.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_triangle_5_form":
            case "triangle_5":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 0),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 90),
                    w = v.points[0],
                    k = v.points[1],
                    z = v.points[2],
                    j = v.points[3],
                    C = G.points[2],
                    L = v.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_trapec_4_form":
            case "trapec_4":
                t.a_m_a1_m_e = t.a - t.a1 - t.e;
                var ct = 0 < t.a_m_a1_m_e ? 1 : -1;
                t.a_m_a1_m_e_p_c = t.a_m_a1_m_e + t.c;
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    Ae = Ie(Fo[vo], Ao[vo], t.a - t.a1, !0, 90),
                    T = Ie(Fo[vo], Ao[vo], t.a1, !0, 90),
                    dt = Ie(Fo[vo], Ao[vo], Math.abs(t.a_m_a1_m_e), !0, 90 * ct),
                    pt = Ie(Fo[vo], Ao[vo], t.a_m_a1_m_e_p_c, !0, 90),
                    x = Ie(Fo[vo], Ao[vo], t.h, !0, 0),
                    qe = Ie(Fo[vo], Ao[vo], t.h1, !0, 0),
                    w = v.points[0],
                    k = v.points[1],
                    z = v.points[2],
                    j = v.points[3],
                    C = Ae.points[2],
                    L = x.points[3],
                    J = dt.points[2],
                    Q = x.points[3],
                    _e = dt.points[2],
                    ae = qe.points[3],
                    re = pt.points[2],
                    ne = qe.points[3];
                if (0 < t.c) var y = createPolyline({
                    points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                    offset_origin: _,
                    is_offset_origin_add: !0
                });
                else var y = createPolyline({
                    points: [w, k, z, j, C, L, J, Q, _e, ae, w, k],
                    offset_origin: _,
                    is_offset_origin_add: !0
                });
                return y;
                break;
            case "target_trapec_5_form":
            case "trapec_5":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    T = Ie(Fo[vo], Ao[vo], t.a1, !0, 90),
                    mt = Ie(Fo[vo], Ao[vo], t.a1 + t.c, !0, 90),
                    ht = Ie(Fo[vo], Ao[vo], t.a1 + t.c - t.e, !0, 90),
                    x = Ie(Fo[vo], Ao[vo], t.h, !0, 0),
                    qe = Ie(Fo[vo], Ao[vo], t.h1, !0, 0),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = T.points[2],
                    L = x.points[3],
                    J = mt.points[2],
                    Q = x.points[3],
                    _e = mt.points[2],
                    ae = qe.points[3],
                    re = ht.points[2],
                    ne = qe.points[3];
                if (0 < t.e) var y = createPolyline({
                    points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                    offset_origin: _,
                    is_offset_origin_add: !0
                });
                else var y = createPolyline({
                    points: [w, k, z, j, C, L, J, Q, _e, ae, w, k],
                    offset_origin: _,
                    is_offset_origin_add: !0
                });
                return y;
                break;
            case "target_train_1_form":
            case "train_1":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    S = Ie(Fo[vo], Ao[vo], t.c, !0, 90),
                    ut = Ie(Fo[vo], Ao[vo], t.b - t.d, !0, 0),
                    ft = Ie(Fo[vo], Ao[vo], t.c - t.e, !0, 90),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = G.points[2],
                    L = G.points[3],
                    J = S.points[2],
                    Q = G.points[3],
                    _e = S.points[2],
                    ae = ut.points[3],
                    re = ft.points[2],
                    ne = ut.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_train_2_form":
            case "train_2":
                t["a-e"] = t.a - t.e;
                var gt = 0 < t["a-e"] ? 1 : -1;
                t["a-e+c"] = t.a - t.e + t.c;
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    Ce = Ie(Fo[vo], Ao[vo], t.f, !0, 0),
                    yt = Ie(Fo[vo], Ao[vo], t.f - t.d, !0, 0),
                    bt = Ie(Fo[vo], Ao[vo], Math.abs(t["a-e"]), !0, 90 * gt),
                    vt = Ie(Fo[vo], Ao[vo], t["a-e+c"], !0, 90),
                    w = v.points[0],
                    k = v.points[1],
                    z = v.points[2],
                    j = v.points[3],
                    C = v.points[2],
                    L = Ce.points[3],
                    J = bt.points[2],
                    Q = Ce.points[3],
                    _e = bt.points[2],
                    ae = yt.points[3],
                    re = vt.points[2],
                    ne = yt.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_paragramm_2_form":
            case "paragramm_2":
                t.cx = Math.sqrt(t.c * t.c - (t.h - t.b) * (t.h - t.b)), t.ex = t.cx + t.d - t.a;
                var xt = 0 < t.ex ? -1 : 1;
                t["a-cx"] = t.a - t.cx;
                var wt = Ie(Fo[vo], Ao[vo], Math.abs(t.ex), !0, 90 * xt),
                    v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    x = Ie(Fo[vo], Ao[vo], t.h, !0, 0),
                    kt = Ie(Fo[vo], Ao[vo], t["a-cx"], !0, 90),
                    w = v.points[0],
                    k = v.points[1],
                    z = v.points[2],
                    j = v.points[3],
                    C = v.points[2],
                    L = G.points[3],
                    J = kt.points[2],
                    Q = x.points[3],
                    _e = wt.points[2],
                    ae = x.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_paragramm_3_form":
            case "paragramm_3":
                t.cx = Math.sqrt(t.c * t.c - (t.h - t.b) * (t.h - t.b)), t.ex = t.cx + t.d - t.a;
                var zt = Ie(Fo[vo], Ao[vo], t.cx, !0, 90),
                    v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    jt = Ie(Fo[vo], Ao[vo], t.a + t.ex, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    x = Ie(Fo[vo], Ao[vo], t.h, !0, 0),
                    w = v.points[2],
                    k = v.points[3],
                    z = v.points[0],
                    j = v.points[1],
                    C = G.points[2],
                    L = G.points[3],
                    J = zt.points[2],
                    Q = x.points[3],
                    _e = jt.points[2],
                    ae = x.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_wigwam_form":
            case "wigwam":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    Lt = Ie(Fo[vo], Ao[vo], t.a + t.b / 2, !0, 90),
                    Ot = Ie(Fo[vo], Ao[vo], t.a + t.b, !0, 90),
                    Ft = Ie(Fo[vo], Ao[vo], t.a + t.b + t.c, !0, 90),
                    qe = Ie(Fo[vo], Ao[vo], t.h1, !0, 0),
                    x = Ie(Fo[vo], Ao[vo], t.h, !0, 0),
                    w = v.points[0],
                    k = v.points[1],
                    z = v.points[2],
                    j = v.points[3],
                    C = Lt.points[2],
                    L = qe.points[3],
                    J = Ot.points[2],
                    Q = Ot.points[3],
                    _e = Ft.points[2],
                    ae = Ft.points[3],
                    re = Lt.points[2],
                    ne = x.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_tank_form":
            case "tank":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    At = Ie(Fo[vo], Ao[vo], t.a + t.a2, !0, 90),
                    T = Ie(Fo[vo], Ao[vo], t.a1, !0, 90),
                    qt = Ie(Fo[vo], Ao[vo], t.a1 + t.c, !0, 90),
                    Xe = Ie(Fo[vo], Ao[vo], t.h2, !0, 0),
                    qe = Ie(Fo[vo], Ao[vo], t.h1, !0, 0),
                    w = v.points[0],
                    k = v.points[1],
                    z = v.points[2],
                    j = v.points[3],
                    C = At.points[2],
                    L = Xe.points[3],
                    J = qt.points[2],
                    Q = qe.points[3],
                    _e = T.points[2],
                    ae = qe.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_tank_2_form":
            case "tank_2":
                var Tt = Ie(Fo[vo], Ao[vo], t.a2, !0, 90),
                    St = Ie(Fo[vo], Ao[vo], t.a + t.a2, !0, 90),
                    Pt = Ie(Fo[vo], Ao[vo], t.a3, !0, 90),
                    It = Ie(Fo[vo], Ao[vo], t.a3 + t.c, !0, 90),
                    Xe = Ie(Fo[vo], Ao[vo], t.h2, !0, 0),
                    qe = Ie(Fo[vo], Ao[vo], t.h1, !0, 0),
                    w = Tt.points[2],
                    k = Tt.points[3],
                    z = St.points[2],
                    j = St.points[3],
                    C = It.points[2],
                    L = qe.points[3],
                    J = Pt.points[2],
                    Q = qe.points[3],
                    _e = Tt.points[0],
                    ae = Xe.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_ftable_form":
            case "ftable":
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    S = Ie(Fo[vo], Ao[vo], t.c, !0, 90),
                    Yt = Ie(Fo[vo], Ao[vo], t.a + t.g, !0, 90),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    x = Ie(Fo[vo], Ao[vo], t.h, !0, 0),
                    w = v.points[0],
                    k = v.points[1],
                    z = G.points[2],
                    j = G.points[3],
                    C = S.points[2],
                    L = G.points[3],
                    J = S.points[2],
                    Q = v.points[1],
                    _e = Yt.points[2],
                    ae = v.points[1],
                    re = Yt.points[2],
                    ne = x.points[3],
                    ce = v.points[2],
                    de = x.points[3],
                    pe = v.points[2],
                    me = v.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, ce, de, pe, me, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_hill_5_form":
            case "hill_5":
                t["a+b/2"] = t.a + t.b / 2, t["a+b"] = t.a + t.b, t["a+b+c"] = t.a + t.b + t.c, t["L1+d"] = t.L1 + t.d, t["L1+d+L2"] = t.L1 + t.d + t.L2, t["L1+d+L2+e"] = t.L1 + t.d + t.L2 + t.e, t["h2+h3"] = t.h2 + t.h3;
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    Lt = Ie(Fo[vo], Ao[vo], t["a+b/2"], !0, 90),
                    Ot = Ie(Fo[vo], Ao[vo], t["a+b"], !0, 90),
                    Ft = Ie(Fo[vo], Ao[vo], t["a+b+c"], !0, 90),
                    Ue = Ie(Fo[vo], Ao[vo], t.L1, !0, 90),
                    Dt = Ie(Fo[vo], Ao[vo], t["L1+d"], !0, 90),
                    Xt = Ie(Fo[vo], Ao[vo], t["L1+d+L2"], !0, 90),
                    Gt = Ie(Fo[vo], Ao[vo], t["L1+d+L2+e"], !0, 90),
                    qe = Ie(Fo[vo], Ao[vo], t.h1, !0, 0),
                    Xe = Ie(Fo[vo], Ao[vo], t.h2, !0, 0),
                    Wt = Ie(Fo[vo], Ao[vo], t["h2+h3"], !0, 0),
                    w = v.points[0],
                    k = v.points[1],
                    z = Ue.points[2],
                    j = qe.points[3],
                    C = Dt.points[2],
                    L = qe.points[3],
                    J = Xt.points[2],
                    Q = Wt.points[3],
                    _e = Gt.points[2],
                    ae = Wt.points[3],
                    re = Ft.points[2],
                    ne = v.points[3],
                    ce = Ot.points[2],
                    de = v.points[3],
                    pe = Lt.points[2],
                    me = Xe.points[3],
                    Ge = v.points[2],
                    We = v.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, ce, de, pe, me, Ge, We, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_hill_6_form":
            case "hill_6":
                t["c+L1"] = t.c + t.L1, t["c+L1+b"] = t.c + t.L1 + t.b;
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    S = Ie(Fo[vo], Ao[vo], t.c, !0, 90),
                    Kt = Ie(Fo[vo], Ao[vo], t["c+L1"], !0, 90),
                    Nt = Ie(Fo[vo], Ao[vo], t["c+L1+b"], !0, 90),
                    qe = Ie(Fo[vo], Ao[vo], t.h1, !0, 0),
                    Xe = Ie(Fo[vo], Ao[vo], t.h2, !0, 0),
                    w = v.points[0],
                    k = v.points[1],
                    z = Xe.points[2],
                    j = Xe.points[3],
                    C = S.points[2],
                    L = Xe.points[3],
                    J = Kt.points[2],
                    Q = qe.points[3],
                    _e = Nt.points[2],
                    ae = qe.points[3],
                    re = v.points[2],
                    ne = v.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            case "target_nest_5_form":
            case "nest_5":
                t["j/2"] = t.j / 2, t["a+j/2"] = t.a + t["j/2"], t["a+j"] = t.a + t.j, t["a+j+e"] = t.a + t.j + t.e;
                var v = Ie(Fo[vo], Ao[vo], t.a, !0, 90),
                    Vt = Ie(Fo[vo], Ao[vo], t["a+j/2"], !0, 90),
                    $t = Ie(Fo[vo], Ao[vo], t["a+j"], !0, 90),
                    Et = Ie(Fo[vo], Ao[vo], t["a+j+e"], !0, 90),
                    Mt = Ie(Fo[vo], Ao[vo], t.i, !0, 0),
                    Ue = Ie(Fo[vo], Ao[vo], t.L1, !0, 0),
                    G = Ie(Fo[vo], Ao[vo], t.b, !0, 0),
                    w = v.points[0],
                    k = v.points[1],
                    z = G.points[2],
                    j = G.points[3],
                    C = Et.points[2],
                    L = G.points[3],
                    J = Et.points[2],
                    Q = Et.points[3],
                    _e = $t.points[2],
                    ae = $t.points[3],
                    re = $t.points[2],
                    ne = Mt.points[3],
                    ce = Vt.points[2],
                    de = Ue.points[3],
                    pe = v.points[2],
                    me = Mt.points[3],
                    Ge = v.points[2],
                    We = v.points[3],
                    y = createPolyline({
                        points: [w, k, z, j, C, L, J, Q, _e, ae, re, ne, ce, de, pe, me, Ge, We, w, k],
                        offset_origin: _,
                        is_offset_origin_add: !0
                    });
                return y;
                break;
            default:
        }
        return null
    }

    /**
     * Создаёт полилинию с заданными параметрами.
     *
     * @param {Object} options - Параметры для создания полилинии.
     * @param {Array} options.points - Координаты точек полилинии.
     * @param {string} [options.pline_start="empty"] - Начало полилинии.
     * @param {string} [options.pline_start_val=""] - Значение начала полилинии.
     * @param {string} [options.pline_end="empty"] - Конец полилинии.
     * @param {string} [options.pline_end_val=""] - Значение конца полилинии.
     * @param {string} [options.side_okras="empty"] - Окраска стороны.
     * @param {string} [options.color=""] - Цвет полилинии.
     * @param {string} [options.cover=""] - Покрытие полилинии.
     * @param {string} [options.thickness=""] - Толщина полилинии.
     * @param {string} [options.size=""] - Размер полилинии.
     * @param {string} [options.amount=""] - Количество.
     * @param {Object} [options.pline_breaks={}] - Разрывы полилинии.
     * @param {Array} [options.pline_lengths_ish=[]] - Длины сегментов полилинии.
     * @param {Object} [options.offset_origin={x: 0, y: 0}] - Смещение начала координат.
     * @param {boolean} [options.is_offset_origin_add=false] - Добавлять ли смещение к координатам.
     * @param {boolean} [options.is_offset_origin_set=false] - Устанавливать ли смещение.
     * @param {Object} [options.offset_origin_set] - Установленное смещение.
     * @param {string} [options.id] - Идентификатор полилинии.
     * @param {string} [options.name] - Имя полилинии.
     * @param {Array} [options.columns_sheets] - Колонки листов.
     * @returns {Konva.Line} - Созданная полилиния.
     */
    function createPolyline(options) {
        // Устанавливаем значения по умолчанию для параметров
        options.pline_start = options.pline_start || "empty";
        options.pline_start_val = options.pline_start_val || "";
        options.pline_end = options.pline_end || "empty";
        options.pline_end_val = options.pline_end_val || "";
        options.side_okras = options.side_okras || "empty";
        options.color = options.color || "";
        options.cover = options.cover || "";
        options.thickness = options.thickness || "";
        options.size = options.size || "";
        options.amount = options.amount || "";
        options.pline_breaks = options.pline_breaks || {};
        options.pline_lengths_ish = options.pline_lengths_ish || [];
        options.offset_origin = options.offset_origin || { x: 0, y: 0 };
        options.is_offset_origin_add = options.is_offset_origin_add || false;
        options.is_offset_origin_set = options.is_offset_origin_set || false;

        // Добавляем смещение к координатам, если это указано
        if (options.is_offset_origin_add) {
            if (options.offset_origin.x !== 0) {
                $.each(options.points, function(index) {
                    if (index % 2 === 0) {
                        options.points[index] += options.offset_origin.x * Go.g_scale[vo] / 100;
                    }
                });
            }
            if (options.offset_origin.y !== 0) {
                $.each(options.points, function(index) {
                    if (index % 2 !== 0) {
                        options.points[index] += -1 * (options.offset_origin.y * Go.g_scale[vo] / 100);
                    }
                });
            }
        }

        // Инкрементируем счётчики
        incrementCounter();
        incrementElementCounter("pline");

        // Устанавливаем идентификатор и имя, если они не заданы
        if (!options.id || options.id === "") {
            options.id = "pline__" + xo;
        }
        if (!options.name || options.name === "") {
            options.name = y_("object_add_layer_row__pline") + " " + wo.pline;
        }

        // Устанавливаем смещение, если это указано
        if (options.is_offset_origin_set) {
            options.offset_origin = JSON.copy(options.offset_origin_set);
        }

        // Создаём объект полилинии
        var polyline = new Konva.Line({
            points: options.points,
            stroke: mainColors.selected_element_color,
            strokeWidth: 2,
            id: options.id,
            name: options.name,
            pline_start: options.pline_start,
            pline_start_val: options.pline_start_val,
            pline_end: options.pline_end,
            pline_end_val: options.pline_end_val,
            side_okras: options.side_okras,
            prod_color: options.color,
            prod_cover: options.cover,
            prod_thickness: options.thickness,
            prod_size: options.size,
            prod_amount: options.amount,
            pline_breaks: options.pline_breaks,
            pline_lengths_ish: options.pline_lengths_ish,
            draggable: false,
            offset_origin: options.offset_origin,
            object_visible: 1
        });

        // Добавляем дополнительные атрибуты, если они заданы
        if (options.columns_sheets) {
            polyline.attrs.columns_sheets = options.columns_sheets;
        }

        // Добавляем обработчики событий
        polyline.on("click", function(event) {
            handleElementClick(event, "pline");
        });
        polyline.on("mousemove", function(event) {
            handleMouseMove(event);
        });
        polyline.on("mouseenter", function(event) {
            highlightPolylineSegment(
                event.evt.layerX,
                event.evt.layerY,
                event.target.attrs.points,
                event.target.attrs.id
            );
        });

        return polyline;
    }

    function Zt(e) {
        $("#" + e).find("input").val(0).prop("disabled", !1).prop("readonly", !1)
    }

    function Jt(e) {
        for (var t = e.points(), _ = t.length, a = 0, r = 0, n = 0; n < _; n++) n % 2 ? r += t[n] : a += t[n];
        a /= _ / 2, r /= _ / 2;
        var s = {
            x_mass: a,
            y_mass: r
        };
        return s
    }

    function Qt(e, t) {
        if (Xt(e), "undefined" != typeof t.errors && 0 < t.errors.length) {
            var _ = "";
            $.each(t.errors, function(e, t) {
                _ += "<li>" + t + "</li>"
            }), $("#" + e).find(".gl_form_err_ul").append(_)
        }
        "undefined" != typeof t.error_ids && 0 < t.error_ids.length && $.each(t.error_ids, function(t, _) {
            $("#" + e).find("#" + _).parent().addClass("f-has-error")
        })
    }

    function Ut(e, t = 2) {
        var _ = 100 * Math.tan(e * l["pi/180"]);
        return 0 <= t && (_ = parseFloat(_.toFixed(t))), _
    }

    function e_(e, t = 2) {
        var _ = Math.atan(e / 100) * l["180/pi"];
        0 <= t && (_ = parseFloat(_.toFixed(t)));
        var a = parseFloat(_.toFixed(0)),
            r = Ut(a);
        return e.toFixed(2) == r.toFixed(2) && (_ = a), _
    }

    function t_(e, t = 2) {
        var _ = 1 / Math.tan(e * l["pi/180"]);
        return 0 <= t && (_ = parseFloat(_.toFixed(t))), _
    }

    function __(e, t = 2) {
        var _ = Math.atan(1 / e) * l["180/pi"];
        0 <= t && (_ = parseFloat(_.toFixed(t)));
        var a = parseFloat(_.toFixed(0)),
            r = t_(a);
        return e.toFixed(2) == r.toFixed(2) && (_ = a), _
    }

    function a_(e, t = 4) {
        var _ = Math.tan(e * l["pi/180"]);
        return 0 <= t && (_ = parseFloat(_.toFixed(t))), _
    }

    function r_(e, t = 2) {
        var _ = Math.atan(e) * l["180/pi"];
        0 <= t && (_ = parseFloat(_.toFixed(t)));
        var a = parseFloat(_.toFixed(0)),
            r = a_(a);
        return e.toFixed(4) == r.toFixed(4) && (_ = a), _
    }

    function n_(e, t = 3) {
        var _ = 1 / Math.cos(e * l["pi/180"]);
        return 0 <= t && (_ = parseFloat(_.toFixed(t))), _
    }

    function s_(e, t = 2) {
        var _ = Math.acos(1 / e) * l["180/pi"];
        0 <= t && (_ = parseFloat(_.toFixed(t)));
        var a = parseFloat(_.toFixed(0)),
            r = n_(a);
        return e.toFixed(3) == r.toFixed(3) && (_ = a), _
    }

    function o_() {}

    /**
     * Обрабатывает нажатия клавиш в зависимости от текущего режима элемента.
     * 
     * @param {number} keyCode - Код нажатой клавиши.
     */
    function handleKeyPress(keyCode) {
        switch (Oo["data-element"]) {
            case "default":
                // Никаких действий для режима "default"
                break;

            case "line":
                // Обработка клавиши Esc для отмены действия с линией
                if (keyCode === 27 && typeof Zi !== "undefined" && Zi.className === "Line") {
                    decrementElementCounter(Oo["data-element"]);
                    resetActiveElement();
                    hideHelperLinesAndText();
                    resetHelperLineHighlighting();
                    c_("btn_finish_cad_draw");
                    c_("btn_finish_cad_draw_close");
                    En();
                    if (b_() === 1) {
                        v_();
                    }
                }
                break;

            case "pline":
                // Обработка клавиш Esc и Enter для завершения работы с полилинией
                if (keyCode === 27 || (keyCode === 13 && $("#btn_finish_cad_draw_close").css("display") === "block")) {
                    let polylineId = "";

                    if (typeof Zi !== "undefined" && typeof Ji === "undefined") {
                        decrementElementCounter(Oo["data-element"]);
                        resetActiveElement();
                    } else if (typeof Zi !== "undefined" && typeof Ji !== "undefined") {
                        polylineId = Zi.id();
                        let points = Zi.points();
                        points = points.slice(0, points.length - 2);

                        if (keyCode === 13) {
                            points.push(points[0], points[1]); // Замыкаем полилинию
                        }

                        Zi.setPoints(points);
                        processAndClearElement(Zi);
                        yt(Zi.id(), false);
                        processElementAndAddMovePoints(Zi, false);

                        if (ji === "break") {
                            di = {
                                type: "h_pline_edit_break_pline",
                                need_layer_num: yo,
                                need_tab_scale_mode: {
                                    before: Li,
                                    after: Go.g_scale[vo]
                                },
                                need_axis: {
                                    g_x: Fo[vo],
                                    g_y: Ao[vo],
                                    current_layer_name: vo
                                },
                                pline_data: {
                                    id: Zi.attrs.id,
                                    points: {
                                        before: JSON.copy(Ci),
                                        after: JSON.copy(Zi.attrs.points)
                                    }
                                }
                            };
                            An({ mode: "add", element: di });
                        } else {
                            di = {
                                type: "h_pline_add_esc_enter",
                                need_layer_num: yo,
                                need_tab_scale: Go.g_scale[vo],
                                need_axis: {
                                    g_x: Fo[vo],
                                    g_y: Ao[vo],
                                    current_layer_name: vo
                                },
                                pline_data: {
                                    id: Zi.attrs.id,
                                    name: Zi.attrs.name,
                                    points: JSON.copy(Zi.attrs.points),
                                    offset_origin: JSON.copy(Zi.attrs.offset_origin),
                                    is_offset_origin_add: true
                                }
                            };
                            An({ mode: "add", element: di });
                        }

                        ji = "";
                        clearTemporaryElements();
                    }

                    qa({ CheckIsVisible: false });
                    se();
                    oe();
                    ie();
                    hideHelperLinesAndText();
                    resetHelperLineHighlighting();
                    c_("btn_finish_cad_draw");
                    c_("btn_finish_cad_draw_close");
                    da();

                    if (b_() === 1) {
                        v_();
                    }

                    En();

                    if (polylineId !== "" && $.inArray(ei.type, ["sznde"]) !== -1) {
                        const polyline = Bi.findOne("#" + polylineId);
                        ms();
                        _n(polylineId, { mode: "create" });
                        rs(polyline);
                        updateElementParametersDisplay(polyline);
                        refreshCurrentLayer();
                        $("#d_elements_button_select").trigger("click");
                    }
                }
                break;

            case "text":
            case "arrow":
                // Обработка клавиши Esc для отмены действия
                if (keyCode === 27) {
                    se();
                    oe();
                    ie();
                }
                break;

            default:
                // Никаких действий для других режимов
                break;
        }
    }

    function l_(e) {
        Qo[e] = !0, $("#" + e).show()
    }

    function c_(e) {
        Qo[e] = !1, $("#" + e).hide()
    }

    function d_(e) {
        var t = e[0].attributes["data-change-element-param"].value;
        switch (t) {
            case "line_length":
                var _ = Zi.id();
                Tl = _;
                var a = e[0].attributes["data-param"].value;
                ++a, m_(_, a);
                break;
            default:
        }
    }

    function p_(e) {
        var t = e[0].attributes["data-change-element-param"].value;
        switch (t) {
            case "line_length":
                var _ = Tl;
                f_(_);
                break;
            default:
        }
    }

    function m_(e, t) {
        $.each($s[vo].children, function(_, a) {
            "undefined" != typeof a.attrs.line_num_counter && (a.attrs.parent_id == e && a.attrs.line_num_counter.toString() == t.toString() ? a.setAttrs({
                fill: "red"
            }) : a.setAttrs({
                fill: "#333"
            }))
        }), $s[vo].draw(), to[vo].draw()
    }

    function h_(e, t) {
        $.each($s[vo].children, function(_, a) {
            "undefined" != typeof a.attrs.zavalc_start_end && (a.attrs.parent_id == e && a.attrs.zavalc_start_end.toString() == t ? a.setAttrs({
                fill: "red"
            }) : a.setAttrs({
                fill: "#333"
            }))
        }), $s[vo].draw(), to[vo].draw()
    }

    function u_(e, t) {
        $.each($s[vo].children, function(_, a) {
            "undefined" != typeof a.attrs.angle_num_counter && (a.attrs.parent_id == e && a.attrs.angle_num_counter.toString() == t.toString() ? a.setAttrs({
                fill: "red"
            }) : a.setAttrs({
                fill: "#333"
            }))
        }), $s[vo].draw(), to[vo].draw()
    }

    function f_(e) {
        $.each($s[vo].children, function(t, _) {
            (_.attrs.parent_id == e || "" == e) && ("undefined" != typeof _.attrs.line_num_counter || "undefined" != typeof _.attrs.angle_num_counter) && _.setAttrs({
                fill: "#333"
            })
        }), $s[vo].draw(), to[vo].draw()
    }

    /**
     * Обрабатывает действия после закрытия модального окна в зависимости от текущего состояния (Bo).
     * Очищает содержимое модального окна и удаляет фоновый элемент модального окна.
     * 
     * @returns {void}
     */
    function handleModalClose() {
        switch (Bo) {
            case "figure":
                // Переключение на режим оси
                Eo = "to_axis";
                break;
                
            case "pline_segment_highlight_set_length":
                // Скрытие элементов выделения сегмента и отображение других элементов
                pi = false;
                no[vo].hide();
                so[vo].hide();
                to[vo].draw();
                mi = false;
                break;
                
            case "lineblock":
                // Очистка и вызов соответствующих функций
                f_(""); 
                A_();
                break;
                
            case "roof_specification_full_project":
                // Удаление PDF спецификации крыши для всего проекта
                SimpleCad.Action({
                    type: "roof_specification_full_project_pdf_remove"
                });
                break;
                
            case "roof_settings_programm":
                // Вызов функции настроек программы для крыши
                Oa();
                break;
                
            case "roof_new":
            case "roof_settings":
                // Отображение нижней части информационного модального окна
                $("#modal_info_footer").show();
                break;
                
            default:
                // Ничего не делаем для других значений Bo
                break;
        }
        
        // Очистка содержимого модального окна и удаление фона
        $("#modal_info_contents").html("");
        $(".modal-backdrop").remove();
    }

    function y_(e) {
        return _i[e][ei.type]
    }

    function b_() {
        var e = 0,
            t = !1,
            _ = "",
            a = "";
        return $.each(to[vo].children, function(r, n) {
            t = !1, _ = n.attrs.name, a = n.className, "undefined" != typeof _ && -1 === $.inArray(_, ["side_okras_arrow"]) && "undefined" != typeof a && -1 === $.inArray(a, ["Text"]) && (t = !0), t && e++
        }), e
    }

    function v_() {
        var e = {
                width: Ui.width(),
                height: Ui.height()
            },
            t = {
                width: e.width - Fo[vo] - 100,
                height: e.height - 100 - 100
            },
            _ = Ee(vo, !1, !1, !1, !1),
            a = t.width / _.width,
            r = t.height / _.height,
            n = 1;
        n = a > r ? r : a, Ke("=", Go.g_scale[vo] * n, !0, !0);
        var s = Ee(vo, !1, !1, !1, !1),
            o = s.x_min - Fo[vo],
            i = s.y_max - Ao[vo];
        Me(-o, -i);
        Es[vo].moveToTop(), Zs[vo].moveToTop(), to[vo].draw()
    }

    function x_() {
        "undefined" != typeof ei.on_change_geometry_or_sizes_or_visible && window[ei.on_change_geometry_or_sizes_or_visible]()
    }

    function w_(e) {
        var t = Zo.modal_lineblock_type.values[e.new_value].set_lineblock_length_on_change,
            _ = Zo.modal_lineblock_type.values[e.new_value].set_lineblock_length_readonly;
        $("#lineblock_length").val(t).prop("readonly", _)
    }

    function k_() {
        x_()
    }

    function z_() {
        "undefined" != typeof ei.start_element_button_icon && $("#collapseOne").find("[data-element=\"" + ei.start_element_button_icon + "\"]").trigger("click")
    }

    function j_() {
        $("#nav_2_btn_trash").removeClass("nav_2_btn_trash_disabled"), Uo = !1
    }

    function C_() {
        $("#nav_2_btn_trash").addClass("nav_2_btn_trash_disabled"), Uo = !0
    }

    function L_(e) {
        var t = Ct({
                filter_type: ["pline"],
                filter_id: e.pline_id
            }),
            _ = O_(t[0], e.line_num_counter);
        F_(_)
    }

    function O_(e, t) {
        var _ = {
                x: 0,
                y: 0
            },
            a = 2 * (parseInt(t) - 1),
            r = 2 * (parseInt(t) - 1) + 1;
        return _.x = e.points[a] - 4, _.y = e.points[r] - 4, _
    }

    function F_(e) {
        "undefined" == typeof go[vo] ? (go[vo] = new Konva.Rect({
            x: e.x,
            y: e.y,
            width: 8,
            height: 8,
            stroke: "red",
            strokeWidth: 4
        }), to[vo].add(go[vo]), to[vo].draw()) : (go[vo].setAttrs({
            visible: !0,
            x: e.x,
            y: e.y,
            zIndex: 5e6
        }), to[vo].draw())
    }

    function A_() {
        "undefined" != typeof go[vo] && (go[vo].visible(!1), to[vo].draw())
    }

    function q_() {
        if (!Qs) return !1;
        Us = !1;
        var e = {};
        e.elements = Ct({
            filter_type: ["pline"],
            filter_visible: "1"
        }), e.params = Mo, K("roof_calc", e), Mo.tabs_re_roof[vo] = 0, Fa()
    }

    function T_(e) {
        Ro = ti.id;
        var t = S_("roof_save");
        K("roof_save", {
            roof_data: t,
            is_restart_autosave: e
        })
    }

    function S_(e) {
        var t = {
                sheet_tabs: [],
                cad_elements: [],
                app_params: [],
                current_layer_num: [],
                roof_data_params: [],
                tabs_axis_point: []
            },
            _ = {
                roof_save: {
                    is_sheet_tabs: !0,
                    is_sheet_tabs_this_layer: !1,
                    is_cad_elements: !0,
                    is_cad_elements_this_layer: !1,
                    is_app_params: !0,
                    is_current_layer_num: !0,
                    is_roof_data_params: !0,
                    is_stringify: !0,
                    is_json_copy: !1,
                    is_tabs_axis_point: !0,
                    get_elements_pr: {
                        what: ["pline_name", "pline_points", "pline_columns_sheets", "pline_tab_num", "offset_origin", "pline_is_object_visible"],
                        is_change_global_current_layer_name: !1,
                        is_sheet_tabs_scale_data: !1,
                        is_pline_scale_without_cuts_get_elements: !1,
                        filter_is_object_visible: "0"
                    }
                },
                roof_menu_edit_sheet_copy: {
                    is_sheet_tabs: !0,
                    is_sheet_tabs_this_layer: !1,
                    is_cad_elements: !0,
                    is_cad_elements_this_layer: !1,
                    is_app_params: !0,
                    is_current_layer_num: !0,
                    is_roof_data_params: !0,
                    is_stringify: !0,
                    is_json_copy: !1,
                    is_tabs_axis_point: !0,
                    get_elements_pr: {
                        what: ["pline_name", "pline_points", "pline_columns_sheets", "pline_tab_num", "offset_origin"],
                        is_change_global_current_layer_name: !1,
                        is_sheet_tabs_scale_data: !1,
                        is_pline_scale_without_cuts_get_elements: !1,
                        filter_is_object_visible: "0"
                    }
                },
                h_sheet_remove: {
                    is_sheet_tabs: !0,
                    is_sheet_tabs_this_layer: !0,
                    is_cad_elements: !0,
                    is_cad_elements_this_layer: !0,
                    is_app_params: !0,
                    is_current_layer_num: !0,
                    is_roof_data_params: !0,
                    is_stringify: !1,
                    is_json_copy: !0,
                    is_tabs_axis_point: !0,
                    get_elements_pr: {
                        what: ["pline_name", "pline_id", "pline_points", "pline_columns_sheets", "pline_tab_num", "offset_origin"],
                        is_change_global_current_layer_name: !1,
                        is_sheet_tabs_scale_data: !1,
                        is_pline_scale_without_cuts_get_elements: !1,
                        filter_is_object_visible: "0"
                    }
                },
                roof_specification_full_project: {
                    is_sheet_tabs: !0,
                    is_sheet_tabs_this_layer: !1,
                    is_cad_elements: !0,
                    is_cad_elements_this_layer: !1,
                    is_app_params: !1,
                    is_current_layer_num: !1,
                    is_roof_data_params: !0,
                    is_stringify: !0,
                    is_json_copy: !1,
                    is_tabs_axis_point: !1,
                    get_elements_pr: {
                        what: ["*"],
                        is_change_global_current_layer_name: !0,
                        is_sheet_tabs_scale_data: !0,
                        is_pline_scale_without_cuts_get_elements: !0,
                        filter_is_object_visible: "1"
                    }
                },
                roof_specification_full_project_table: {
                    is_sheet_tabs: !0,
                    is_sheet_tabs_this_layer: !1,
                    is_cad_elements: !0,
                    is_cad_elements_this_layer: !1,
                    is_app_params: !1,
                    is_current_layer_num: !1,
                    is_roof_data_params: !1,
                    is_stringify: !1,
                    is_json_copy: !1,
                    is_tabs_axis_point: !1,
                    get_elements_pr: {
                        what: ["*"],
                        is_change_global_current_layer_name: !0,
                        is_sheet_tabs_scale_data: !0,
                        is_pline_scale_without_cuts_get_elements: !0,
                        filter_is_object_visible: "1"
                    }
                }
            } [e];
        if (_.is_app_params && (t.app_params = Go), _.is_current_layer_num && (t.current_layer_num = yo), _.is_roof_data_params && (t.roof_data_params = Mo), _.is_tabs_axis_point && (t.tabs_axis_point = {
                g_x: JSON.copy(Fo),
                g_y: JSON.copy(Ao)
            }), _.is_sheet_tabs) {
            var a = rl.find(".d_bottom_tab");
            $.each(a, function(e, a) {
                var r = {
                    tab_name: $(a)[0].innerText,
                    tab_num: $(a)[0].attributes["data-layer-num"].value,
                    tab_index: e
                };
                (!1 == _.is_sheet_tabs_this_layer || _.is_sheet_tabs_this_layer && parseInt(r.tab_num) == yo) && t.sheet_tabs.push(r)
            })
        }
        var r = "";
        if (_.is_cad_elements) {
            var n = al.find(".d_object");
            if ($.each(n, function(e, a) {
                    var n = $(a).find(".d_object_name")[0].attributes["data-obj-id"].value,
                        s = $(a)[0].attributes["data-current_layer_name"].value;
                    if (!1 == _.is_cad_elements_this_layer || _.is_cad_elements_this_layer && s == vo) {
                        _.get_elements_pr.is_change_global_current_layer_name && (r = vo, vo = s);
                        var o = Ct({
                            layer_name: s,
                            filter_id: n,
                            filter_type: ["pline"],
                            what: _.get_elements_pr.what,
                            is_pline_scale_without_cuts_get_elements: _.get_elements_pr.is_pline_scale_without_cuts_get_elements,
                            filter_is_object_visible: _.get_elements_pr.filter_is_object_visible
                        });
                        _.get_elements_pr.is_change_global_current_layer_name && (vo = r, r = ""), "undefined" != typeof o[0] && t.cad_elements.push(o[0])
                    }
                }), _.get_elements_pr.is_sheet_tabs_scale_data) {
                var s = !1;
                0 < t.cad_elements.length && (s = !0), $.each(t.sheet_tabs, function(e, _) {
                    t.sheet_tabs[e].scale_data = {
                        slope_length: 0,
                        scale_without_cuts: 0,
                        scale: 0,
                        scale_sheets_full: 0,
                        scale_sheets_useful: 0,
                        scale_sheets_waste: 0
                    }, s && $.each(t.cad_elements, function(a, r) {
                        parseInt(_.tab_num) == parseInt(r.tab_num) && "undefined" != typeof r.columns_sheets && 0 == t.sheet_tabs[e].scale_data.slope_length && (t.sheet_tabs[e].scale_data = {
                            slope_length: r.slope_length,
                            scale_without_cuts: r.scale_without_cuts,
                            scale: r.scale,
                            scale_sheets_full: r.scale_sheets_full,
                            scale_sheets_useful: r.scale_sheets_useful,
                            scale_sheets_waste: r.scale_sheets_waste
                        })
                    })
                })
            }
        }
        return _.is_stringify && (t = JSON.stringify(t)), _.is_json_copy && (t = JSON.copy(t)), t
    }

    function P_(e) {
        Gn(), K("roof_load", e)
    }

    function I_(e) {
        if ("undefined" != typeof e.data.g_project_file_set_id) {
            $("#roof_welcome").hide(), Dn(), p(), ti.id = e.data.g_project_file_set_id, "undefined" != typeof e.data.g_project_file_set_name && (ti.name = e.data.g_project_file_set_name), "undefined" != typeof e.roof_load_result && ("undefined" != typeof e.roof_load_result.data.app_params && (Go = e.roof_load_result.data.app_params), "undefined" != typeof e.roof_load_result.data.roof_data_params && (Mo = e.roof_load_result.data.roof_data_params), "undefined" != typeof e.roof_load_result.data.tabs_axis_point && (Fo = JSON.copy(e.roof_load_result.data.tabs_axis_point.g_x), Ao = JSON.copy(e.roof_load_result.data.tabs_axis_point.g_y)), "undefined" != typeof e.roof_load_result.data.sheet_tabs && $.each(e.roof_load_result.data.sheet_tabs, function(e, t) {
                configureLayerSettings({
                    type: "",
                    set_current_layer_num: t.tab_num,
                    set_tab_text: t.tab_name,
                    history: !1
                }), bo = parseInt(t.tab_num)
            }), "undefined" != typeof e.roof_load_result.data.cad_elements && ($.each(e.roof_load_result.data.cad_elements, function(e, t) {
                var _ = createPolyline({
                    points: t.points,
                    offset_origin: t.offset_origin,
                    is_offset_origin_add: !1
                });
                _.attrs.columns_sheets = t.columns_sheets, _.attrs.stroke = mainColors.default_element_color, vo = "layer_" + t.tab_num, yo = parseInt(t.tab_num), to[vo].add(_), I({
                    "data-element": "pline",
                    id: _.id()
                }), _.attrs.is_object_visible = t.is_object_visible, 0 == _.attrs.is_object_visible && (_.hide(), al.find("[data-obj-id=\"" + _.id() + "\"]").parent().find(".fa").removeClass("fa-eye").addClass("fa-eye-slash")), 1 == _.attrs.is_object_visible && processElementAndAddMovePoints(_, !1)
            }), $.each(to, function(e) {
                vo = e + "", yo = parseInt(vo.replace("layer_", "")), processLayerElements({
                    CheckIsVisible: !1
                }), gt({
                    CheckIsVisible: !1
                }), W_({
                    CheckIsVisible: !1
                }), to[vo].batchDraw()
            }), se(), ie(), oe(), Ra(), Ha(), Ja(), al.find(".d_object").hide(), al.find("[data-current_layer_name=\"" + vo + "\"]").show())), la();
            var t = ti.name.replace("[[", "").replace("]]", "");
            $("#r_d_nav_bot_file").html("<b>id:</b> " + ti.id + "&nbsp;&nbsp; <b>\u0424\u0430\u0439\u043B:</b> " + t), SimpleCad.Action({
                type: "roof_data_params_add_no_backend_data_update_gap_y"
            }), SimpleCad.Action({
                type: "roof_data_params_add_no_backend_data_update_warehouse_calc_vars"
            }), SimpleCad.Action({
                type: "roof_data_params_add_no_backend_data_update_sheet_max_length_list_update_select"
            }), Fa(), ui[vo] = "1", Ke("+", "", !1, !1), Ke("-", "", !0, !0), ca(), da(), "undefined" != typeof e.roof_load_result.data.current_layer_num && rl.find("[data-layer-num=\"" + e.roof_load_result.data.current_layer_num + "\"]").trigger("click"), 1 == Mo.tabs_re_roof[vo] && q_(), ae(), An({
                mode: "graph"
            }), La(), sl.find(".sheet_btn").hide(), sl.find(".sheet_btn_" + Mo.type).show(), $("#modal_html").modal("hide"), qn()
        }
    }

    function Y_(e) {
        if ("undefined" == typeof e.roof_calc_result || "undefined" == typeof e.roof_calc_result.roof_data) return void alert("#1 \u041E\u0448\u0438\u0431\u043A\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u0440\u0430\u0441\u0447\u0451\u0442\u0430.");
        if ("undefined" == typeof e.roof_calc_result.roof_data.slope || "undefined" == typeof e.roof_calc_result.roof_data.slope.front_id) return void alert("#2 \u041E\u0448\u0438\u0431\u043A\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u0440\u0430\u0441\u0447\u0451\u0442\u0430.");
        if ("undefined" == typeof e.roof_calc_result.roof_data.data || "undefined" == typeof e.roof_calc_result.roof_data.data.columns_sheets) return void alert("#3 \u041E\u0448\u0438\u0431\u043A\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u0440\u0430\u0441\u0447\u0451\u0442\u0430.");
        0 < e.roof_calc_result.errors.length && alert("#4 \u041E\u0448\u0438\u0431\u043A\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u0440\u0430\u0441\u0447\u0451\u0442\u0430. " + e.roof_calc_result.errors);
        var t = Bi.findOne("#" + e.roof_calc_result.roof_data.slope.front_id);
        "undefined" == typeof t.attrs.columns_sheets && (t.attrs.columns_sheets = []), Ai && (di = {
            type: "h_roof_columns_sheet_success_calc",
            need_layer_num: yo,
            need_axis: {
                g_x: Fo[vo],
                g_y: Ao[vo],
                current_layer_name: vo
            },
            slope_id: t.attrs.id,
            g_selected_sheets: JSON.copy(oi),
            roof_data_params_tracking: JSON.copy(Oi),
            slope_columns_sheets: {
                before: JSON.copy(t.attrs.columns_sheets)
            }
        }, Oi = {}), t.attrs.columns_sheets = e.roof_calc_result.roof_data.data.columns_sheets, Ai && (di.slope_columns_sheets.after = JSON.copy(t.attrs.columns_sheets), An({
            mode: "add",
            element: di
        })), Ai = !0, ae(), $_(t.id()), N_(t), da(), to[vo].draw()
    }

    function D_(e, _, a) {
        for (var r = [], n = e.length, s = 0, o; s < n; s++) o = s % 2 ? e[s] - _.y_min : e[s] - _.x_min, o = 100 * o / Go.g_scale[vo], o = nn(o), r.push(o);
        return a && (r = r.slice(0, n - 2)), r
    }

    function X_(e) {
        var t = {};
        return t.x_min = 100 * e.x_min / Go.g_scale[vo], t.x_max = 100 * e.x_max / Go.g_scale[vo], t.y_max = 100 * e.y_max / Go.g_scale[vo], t.y_min = 100 * e.y_min / Go.g_scale[vo], t.x_min = nn(t.x_min), t.x_max = nn(t.x_max), t.y_max = nn(t.y_max), t.y_min = nn(t.y_min), t
    }

    function G_(e) {
        for (var t = e.length, _ = 1e12, a = 1e12, r = -1e12, n = -1e12, s = 0; s < t; s++) s % 2 ? (e[s] < a && (a = e[s]), e[s] > n && (n = e[s])) : (e[s] < _ && (_ = e[s]), e[s] > r && (r = e[s]));
        var o = _ + (r - _) / 2,
            l = a + (n - a) / 2;
        return {
            x_min: _,
            y_min: a,
            x_max: r,
            y_max: n,
            x_mid: o,
            y_mid: l
        }
    }

    function W_(e) {
        var t = !0;
        "undefined" != typeof e.CheckIsVisible && !1 == e.CheckIsVisible && (t = !1), K_(), $.each(to[vo].children, function(e, _) {
            ("undefined" == typeof _.attrs.is_object_visible || 1 == _.attrs.is_object_visible) && (!1 == t || t && _.isVisible()) && "undefined" != typeof _.attrs.id && "undefined" != typeof _.attrs.columns_sheets && N_(_)
        })
    }

    function K_() {
        Bs[vo].destroyChildren()
    }

    function N_(e) {
        var t = G_(e.points()),
            _ = {
                left: t.x_min,
                top: t.y_min,
                right: t.x_max,
                bottom: t.y_max
            },
            a = 0;
        $.each(e.attrs.columns_sheets, function(t, r) {
            $.each(r, function(r, n) {
                V_(n, _, e.id(), t, r), a++
            })
        })
    }

    function V_(e, t, _, a, r) {
        var n = _ + "_col_" + a + "_sh_" + r,
            s = {};
        s = "undefined" == typeof oi[n] ? {
            color: "sheet_color",
            width: 1
        } : {
            color: "selected_element_color",
            width: 2
        };
        var o = {
            x: 1 * t.left + 1 * e.left * Go.g_scale[vo] / 100 / Mo.unit_coefficient,
            y: t.bottom - e.bottom * Go.g_scale[vo] / 100 / Mo.unit_coefficient
        };
        switch (Mo.type) {
            case "mch":
            case "mch_modul":
            case "pn":
            case "falc":
            case "siding_vert":
                o.width = (e.right - e.left) * Go.g_scale[vo] / 100 / Mo.unit_coefficient, o.height = -1 * (e.length * Go.g_scale[vo] / 100) / Mo.unit_coefficient;
                break;
            case "siding":
                o.width = e.length * Go.g_scale[vo] / 100 / Mo.unit_coefficient, o.height = -1 * ((e.top - e.bottom) * Go.g_scale[vo] / 100) / Mo.unit_coefficient;
                break;
            default:
        }
        var l = new Konva.Rect({
            x: o.x,
            y: o.y,
            width: o.width,
            height: o.height,
            stroke: mainColors[s.color],
            strokeWidth: s.width,
            id: "roof_sheet_" + zo,
            id_sheet: n,
            column_i: a,
            sheet_i: r,
            parent_id: _,
            visible: !0,
            opacity: 1,
            draggable: !1,
            listening: !0
        });
        if (l.on("mouseenter", function(e) {
                document.body.style.cursor = "pointer";
                var t = e.target;
                "undefined" == typeof oi[n] && (t.stroke(mainColors.selected_element_color), t.strokeWidth(2), to[vo].batchDraw())
            }), l.on("mouseleave", function(e) {
                var t = e.target;
                document.body.style.cursor = "default", "undefined" == typeof oi[n] && (t.stroke(mainColors.default_element_color), t.strokeWidth(1), to[vo].batchDraw())
            }), l.on("click", function(e) {
                switch (ye(e), Oo.mode) {
                    case "":
                    case "default":
                        M_(e);
                        break;
                    default:
                }
            }), l.on("mousemove", function(e) {
                handleCanvasMouseMove(e)
            }), l.on("mousedown", function(e) {
                be(e)
            }), l.on("mouseup", function(e) {
                ve(e)
            }), l.on("wheel", function(e) {
                we(e)
            }), Bs[vo].add(l), "mch" == Mo.type)
            for (var c = Math.floor(e.length / Mo.wave_length) + 1, d = {
                    xl: l.attrs.x,
                    xr: l.attrs.x + l.attrs.width
                }, p = 0; p < c; p++) {
                d.y = l.attrs.y - p * Mo.wave_length * Go.g_scale[vo] / 100 / Mo.unit_coefficient;
                var m = new Konva.Line({
                    points: [d.xl, d.y, d.xr, d.y],
                    stroke: "#c1c1c1",
                    tension: 1,
                    strokeWidth: 1,
                    parent_id: _
                });
                Bs[vo].add(m)
            }
        var h = {
            x_minus: 10,
            rotation: 0
        };
        if ("undefined" != typeof Mo.sheet_length_text_mode[vo]) switch (Mo.sheet_length_text_mode[vo]) {
            case "center_hor":
                break;
            case "center_vert":
                h = {
                    x_minus: 5,
                    rotation: -90
                };
                break;
            default:
        }
        var u = new Konva.Text({
            x: l.attrs.x + l.attrs.width / 2 - h.x_minus,
            y: l.attrs.y + l.attrs.height / 2 - 2,
            text: (e.length / 1e3).toFixed(2),
            fontSize: 14,
            fontFamily: "Arial",
            fontStyle: "bold",
            rotation: h.rotation,
            fill: "#0c65a7",
            id: "roof_sheet_length_text_" + zo,
            draggable: !1,
            parent_id: _,
            visible: !0,
            listening: !1
        });
        Bs[vo].add(u), zo++
    }

    function $_(e) {
        $.each(Bs[vo].children, function(t, _) {
            _.attrs.parent_id == e && _.hide()
        })
    }

    function E_(e) {
        switch (e.param) {
            case "sheet_max_length":
                switch (e.mode) {
                    case "plus":
                        if (Us) {
                            var t = $("#roof_param_sheet_max_length_select").val(),
                                _ = $("#roof_param_sheet_max_length_select > option:selected").next().val();
                            parseInt(_) > parseInt(t) && ($("#roof_param_sheet_max_length_select > option:selected").prop("selected", !1).next().prop("selected", !0), Mo.sheet_max_length[vo] = parseInt(_), Oi = {
                                param: "sheet_max_length",
                                before: parseInt(t),
                                after: Mo.sheet_max_length[vo]
                            }, q_())
                        }
                        break;
                    case "minus":
                        if (Us) {
                            var t = $("#roof_param_sheet_max_length_select").val(),
                                a = $("#roof_param_sheet_max_length_select > option:selected").prev().val();
                            parseInt(a) < parseInt(t) && ($("#roof_param_sheet_max_length_select > option:selected").prop("selected", !1).prev().prop("selected", !0), Mo.sheet_max_length[vo] = parseInt(a), Oi = {
                                param: "sheet_max_length",
                                before: parseInt(t),
                                after: Mo.sheet_max_length[vo]
                            }, q_())
                        }
                        break;
                    case "set":
                        if (Us) {
                            var t = $("#roof_param_sheet_max_length_select").val();
                            Oi = {
                                param: "sheet_max_length",
                                before: Mo.sheet_max_length[vo],
                                after: parseInt(t)
                            }, Mo.sheet_max_length[vo] = parseInt(t), q_()
                        }
                        break;
                    default:
                }
                break;
            case "sheet_max_length_pn":
            case "sheet_max_length_falc":
                switch (e.mode) {
                    case "plus":
                        if (Us) {
                            var r = U_(Mo.sheet_max_length[vo] + 10 * e.size);
                            r <= Mo.sheet_max_length_tech && (Oi = {
                                param: "sheet_max_length",
                                before: Mo.sheet_max_length[vo],
                                after: r
                            }, Mo.sheet_max_length[vo] = r, $("#roof_param_sheet_max_length_" + Mo.type + "_input").val((Mo.sheet_max_length[vo] / 1e3).toFixed(2)), q_())
                        }
                        break;
                    case "minus":
                        if (Us) {
                            var r = _a(Mo.sheet_max_length[vo] - 10 * e.size);
                            r >= Mo.sheet_min_length_tech && (Oi = {
                                param: "sheet_max_length",
                                before: Mo.sheet_max_length[vo],
                                after: r
                            }, Mo.sheet_max_length[vo] = r, $("#roof_param_sheet_max_length_" + Mo.type + "_input").val((Mo.sheet_max_length[vo] / 1e3).toFixed(2)), q_())
                        }
                        break;
                    case "input":
                        $("#nav_roof_sheet_max_length_" + Mo.type + "_input_confirm_block").hasClass("active") || $("#nav_roof_sheet_max_length_" + Mo.type + "_input_confirm_block").addClass("active");
                        break;
                    case "keyup":
                        var n = e.eventObject.keyCode;
                        13 == n ? SimpleCad.Action({
                            type: "roof_params_change",
                            param: "sheet_max_length_" + Mo.type,
                            mode: "submit"
                        }) : 27 == n && SimpleCad.Action({
                            type: "roof_params_change",
                            param: "sheet_max_length_" + Mo.type,
                            mode: "cancel"
                        });
                        break;
                    case "submit":
                        if (Us) {
                            var r = U_(1e3 * U($("#roof_param_sheet_max_length_" + Mo.type + "_input").val()));
                            r > Mo.sheet_max_length_tech ? r = Mo.sheet_max_length_tech : r < Mo.sheet_min_length_tech && (r = Mo.sheet_min_length_tech), Oi = {
                                param: "sheet_max_length",
                                before: Mo.sheet_max_length[vo],
                                after: r
                            }, Mo.sheet_max_length[vo] = r, $("#roof_param_sheet_max_length_" + Mo.type + "_input").val((Mo.sheet_max_length[vo] / 1e3).toFixed(2)), q_(), $("#nav_roof_sheet_max_length_" + Mo.type + "_input_confirm_block").removeClass("active")
                        }
                        break;
                    case "cancel":
                        $("#roof_param_sheet_max_length_" + Mo.type + "_input").val((Mo.sheet_max_length[vo] / 1e3).toFixed(2)), $("#nav_roof_sheet_max_length_" + Mo.type + "_input_confirm_block").removeClass("active");
                        break;
                    default:
                }
                break;
            case "offset_x_mirror":
                Mo.offset_x[vo] *= -1, $("#roof_param_offset_x_input").val((Mo.offset_x[vo] / 1e3).toFixed(2));
                break;
            case "offset_x":
                var s = 0;
                switch (Mo.type) {
                    case "mch":
                    case "mch_modul":
                    case "pn":
                    case "falc":
                    case "siding_vert":
                        s = Mo.sheet_width_useful;
                        break;
                    case "siding":
                        s = Mo.sheet_max_length_tech - Mo.gap_y;
                        break;
                    default:
                }
                switch (e.mode) {
                    case "plus":
                        if (Us) {
                            var r = Mo.offset_x[vo] + 10 * Mo.offset_x_step;
                            r <= s && (Oi = {
                                param: "offset_x",
                                before: Mo.offset_x[vo],
                                after: r
                            }, Mo.offset_x[vo] = r, $("#roof_param_offset_x_input").val((Mo.offset_x[vo] / 1e3).toFixed(2)), q_())
                        }
                        break;
                    case "minus":
                        if (Us) {
                            var r = Mo.offset_x[vo] - 10 * Mo.offset_x_step;
                            r >= -1 * s && (Oi = {
                                param: "offset_x",
                                before: Mo.offset_x[vo],
                                after: r
                            }, Mo.offset_x[vo] = r, $("#roof_param_offset_x_input").val((Mo.offset_x[vo] / 1e3).toFixed(2)), q_())
                        }
                        break;
                    case "step":
                        Mo.offset_x_step = {
                            ox1: 5,
                            ox5: 10,
                            ox10: 1
                        } ["ox" + Mo.offset_x_step], $("#roof_param_offset_x_rect").html(Mo.offset_x_step);
                        break;
                    case "input":
                        $("#nav_roof_offset_x_input_confirm_block").hasClass("active") || $("#nav_roof_offset_x_input_confirm_block").addClass("active");
                        break;
                    case "keyup":
                        var n = e.eventObject.keyCode;
                        13 == n ? SimpleCad.Action({
                            type: "roof_params_change",
                            param: "offset_x",
                            mode: "submit"
                        }) : 27 == n && SimpleCad.Action({
                            type: "roof_params_change",
                            param: "offset_x",
                            mode: "cancel"
                        });
                        break;
                    case "submit":
                        if (Us) {
                            var r = 1e3 * U($("#roof_param_offset_x_input").val());
                            r > s ? r = s : r < -1 * s && (r = -1 * s), Oi = {
                                param: "offset_x",
                                before: Mo.offset_x[vo],
                                after: r
                            }, Mo.offset_x[vo] = r, $("#roof_param_offset_x_input").val((Mo.offset_x[vo] / 1e3).toFixed(2)), q_(), $("#nav_roof_offset_x_input_confirm_block").removeClass("active")
                        }
                        break;
                    case "cancel":
                        $("#roof_param_offset_x_input").val((Mo.offset_x[vo] / 1e3).toFixed(2)), $("#nav_roof_offset_x_input_confirm_block").removeClass("active");
                        break;
                    default:
                }
                break;
            case "offset_y":
                var o = 0;
                switch (Mo.type) {
                    case "mch":
                    case "mch_modul":
                    case "pn":
                    case "falc":
                    case "siding_vert":
                        o = Mo.sheet_max_length_tech - Mo.gap_y;
                        break;
                    case "siding":
                        o = Mo.sheet_width_useful;
                        break;
                    default:
                }
                switch (e.mode) {
                    case "plus":
                        if (Us) {
                            var r = Mo.offset_y[vo] + 10 * Mo.offset_y_step;
                            r <= o && (Oi = {
                                param: "offset_y",
                                before: Mo.offset_y[vo],
                                after: r
                            }, Mo.offset_y[vo] = r, $("#roof_param_offset_y_input").val((Mo.offset_y[vo] / 1e3).toFixed(2)), q_())
                        }
                        break;
                    case "minus":
                        if (Us) {
                            var r = Mo.offset_y[vo] - 10 * Mo.offset_y_step;
                            r >= -1 * o && (Oi = {
                                param: "offset_y",
                                before: Mo.offset_y[vo],
                                after: r
                            }, Mo.offset_y[vo] = r, $("#roof_param_offset_y_input").val((Mo.offset_y[vo] / 1e3).toFixed(2)), q_())
                        }
                        break;
                    case "step":
                        Mo.offset_y_step = {
                            oy1: 5,
                            oy5: 10,
                            oy10: 1
                        } ["oy" + Mo.offset_y_step], $("#roof_param_offset_y_rect").html(Mo.offset_y_step);
                        break;
                    case "input":
                        $("#nav_roof_offset_y_input_confirm_block").hasClass("active") || $("#nav_roof_offset_y_input_confirm_block").addClass("active");
                        break;
                    case "keyup":
                        var n = e.eventObject.keyCode;
                        13 == n ? SimpleCad.Action({
                            type: "roof_params_change",
                            param: "offset_y",
                            mode: "submit"
                        }) : 27 == n && SimpleCad.Action({
                            type: "roof_params_change",
                            param: "offset_y",
                            mode: "cancel"
                        });
                        break;
                    case "submit":
                        if (Us) {
                            var r = 1e3 * U($("#roof_param_offset_y_input").val());
                            r > o ? r = o : r < -1 * o && (r = -1 * o), Oi = {
                                param: "offset_y",
                                before: Mo.offset_y[vo],
                                after: r
                            }, Mo.offset_y[vo] = r, $("#roof_param_offset_y_input").val((Mo.offset_y[vo] / 1e3).toFixed(2)), q_(), $("#nav_roof_offset_y_input_confirm_block").removeClass("active")
                        }
                        break;
                    case "cancel":
                        $("#roof_param_offset_y_input").val((Mo.offset_y[vo] / 1e3).toFixed(2)), $("#nav_roof_offset_y_input_confirm_block").removeClass("active");
                        break;
                    default:
                }
                break;
            case "cornice":
                switch (e.mode) {
                    case "input":
                        $("#nav_roof_cornice_input_confirm_block").hasClass("active") || $("#nav_roof_cornice_input_confirm_block").addClass("active");
                        break;
                    case "keyup":
                        var n = e.eventObject.keyCode;
                        13 == n ? SimpleCad.Action({
                            type: "roof_params_change",
                            param: "cornice",
                            mode: "submit"
                        }) : 27 == n && SimpleCad.Action({
                            type: "roof_params_change",
                            param: "cornice",
                            mode: "cancel"
                        });
                        break;
                    case "submit":
                        if (Us) {
                            var i = Mo.cornice[vo];
                            Mo.cornice[vo] = 1e3 * U($("#roof_param_cornice_input").val()), 1e3 < Mo.cornice[vo] ? Mo.cornice[vo] = 1e3 : 0 > Mo.cornice[vo] && (Mo.cornice[vo] = 0), Oi = {
                                param: "cornice",
                                before: i,
                                after: Mo.cornice[vo]
                            }, $("#roof_param_cornice_input").val((Mo.cornice[vo] / 1e3).toFixed(2)), q_(), $("#nav_roof_cornice_input_confirm_block").removeClass("active")
                        }
                        break;
                    case "cancel":
                        $("#roof_param_cornice_input").val((Mo.cornice[vo] / 1e3).toFixed(2)), $("#nav_roof_cornice_input_confirm_block").removeClass("active");
                        break;
                    default:
                }
                break;
            case "direction":
                if (Us) {
                    var l = Mo.direction[vo];
                    switch (Mo.direction[vo]) {
                        case "lr":
                            Mo.direction[vo] = "rl", $("#roof_param_direction_icon").removeClass("nav_roof_icon_direction_lr").addClass("nav_roof_icon_direction_rl");
                            break;
                        case "rl":
                            Mo.direction[vo] = "lr", $("#roof_param_direction_icon").removeClass("nav_roof_icon_direction_rl").addClass("nav_roof_icon_direction_lr");
                            break;
                        default:
                    }
                    Oi = {
                        param: "direction",
                        before: l,
                        after: Mo.direction[vo]
                    }, q_()
                }
                break;
            case "direction_y":
                if (Us) {
                    var c = Mo.direction_y[vo];
                    switch (Mo.direction_y[vo]) {
                        case "du":
                            Mo.direction_y[vo] = "ud", $("#roof_param_direction_y_icon").removeClass("nav_roof_icon_direction_du").addClass("nav_roof_icon_direction_ud");
                            break;
                        case "ud":
                            Mo.direction_y[vo] = "du", $("#roof_param_direction_y_icon").removeClass("nav_roof_icon_direction_ud").addClass("nav_roof_icon_direction_du");
                            break;
                        default:
                    }
                    Oi = {
                        param: "direction_y",
                        before: c,
                        after: Mo.direction_y[vo]
                    }, q_()
                }
                break;
            case "offset_run_type":
                if (Us) {
                    var d = Mo.offset_run_type[vo];
                    "long_short" == Mo.offset_run_type[vo] ? (Mo.offset_run_type[vo] = "short_long", $("#roof_param_offset_run_type_icon").removeClass("nav_roof_icon_offset_run_type_long_short").addClass("nav_roof_icon_offset_run_type_short_long")) : "short_long" == Mo.offset_run_type[vo] && (Mo.offset_run_type[vo] = "long_short", $("#roof_param_offset_run_type_icon").removeClass("nav_roof_icon_offset_run_type_short_long").addClass("nav_roof_icon_offset_run_type_long_short")), Oi = {
                        param: "offset_run_type",
                        before: d,
                        after: Mo.offset_run_type[vo]
                    }, q_()
                }
                break;
            case "direction_toggle_no_roof":
                switch (Mo.direction[vo]) {
                    case "lr":
                        Mo.direction[vo] = "rl", $("#roof_param_direction_icon").removeClass("nav_roof_icon_direction_lr").addClass("nav_roof_icon_direction_rl");
                        break;
                    case "rl":
                        Mo.direction[vo] = "lr", $("#roof_param_direction_icon").removeClass("nav_roof_icon_direction_rl").addClass("nav_roof_icon_direction_lr");
                        break;
                    default:
                }
                break;
            case "direction_y_toggle_no_roof":
                switch (Mo.direction_y[vo]) {
                    case "du":
                        Mo.direction_y[vo] = "ud", $("#roof_param_direction_y_icon").removeClass("nav_roof_icon_direction_du").addClass("nav_roof_icon_direction_ud");
                        break;
                    case "ud":
                        Mo.direction_y[vo] = "du", $("#roof_param_direction_y_icon").removeClass("nav_roof_icon_direction_ud").addClass("nav_roof_icon_direction_du");
                        break;
                    default:
                }
                break;
            case "offset_run_type_toggle_no_roof":
                "long_short" == Mo.offset_run_type[vo] ? (Mo.offset_run_type[vo] = "short_long", $("#roof_param_offset_run_type_icon").removeClass("nav_roof_icon_offset_run_type_long_short").addClass("nav_roof_icon_offset_run_type_short_long")) : "short_long" == Mo.offset_run_type[vo] && (Mo.offset_run_type[vo] = "long_short", $("#roof_param_offset_run_type_icon").removeClass("nav_roof_icon_offset_run_type_short_long").addClass("nav_roof_icon_offset_run_type_long_short"));
                break;
            case "sheet_length_text_mode":
                if (!$("#nav_li_view_sheet_length_text_mode_center_hor").hasClass("disabled")) {
                    switch (e.mode) {
                        case "switch":
                            switch (Mo.sheet_length_text_mode[vo]) {
                                case "center_hor":
                                    Mo.sheet_length_text_mode[vo] = "center_vert";
                                    break;
                                case "center_vert":
                                    Mo.sheet_length_text_mode[vo] = "center_hor";
                                    break;
                                default:
                            }
                            break;
                        case "set":
                            Mo.sheet_length_text_mode[vo] = e.value;
                            break;
                        default:
                    }
                    switch (Mo.sheet_length_text_mode[vo]) {
                        case "center_hor":
                            $("#roof_param_sheet_length_text_mode_icon").removeClass("nav_roof_icon_sheet_length_text_mode_center_vert").addClass("nav_roof_icon_sheet_length_text_mode_center_hor"), $("#nav_li_view_sheet_length_text_mode_center_hor").find("i.fa-check").show(), $("#nav_li_view_sheet_length_text_mode_center_vert").find("i.fa-check").hide(), $("#nav_li_view_sheet_length_text_mode_center_hor_context").find("i.fa-check").show(), $("#nav_li_view_sheet_length_text_mode_center_vert_context").find("i.fa-check").hide();
                            break;
                        case "center_vert":
                            $("#roof_param_sheet_length_text_mode_icon").removeClass("nav_roof_icon_sheet_length_text_mode_center_hor").addClass("nav_roof_icon_sheet_length_text_mode_center_vert"), $("#nav_li_view_sheet_length_text_mode_center_hor").find("i.fa-check").hide(), $("#nav_li_view_sheet_length_text_mode_center_vert").find("i.fa-check").show(), $("#nav_li_view_sheet_length_text_mode_center_hor_context").find("i.fa-check").hide(), $("#nav_li_view_sheet_length_text_mode_center_vert_context").find("i.fa-check").show();
                            break;
                        default:
                    }
                    W_({}), to[vo].batchDraw()
                }
                break;
            default:
        }
    }

    function M_(e) {
        var t = e.target,
            _ = t.attrs.id_sheet;
        ii = Bi.findOne("#" + t.attrs.parent_id), e.evt.ctrlKey ? "undefined" == typeof oi[_] ? oi[_] = {} : delete oi[_] : "undefined" == typeof oi[_] ? (oi = {}, oi[_] = {}) : 1 == Object.keys(oi).length ? oi = {} : (oi = {}, oi[_] = {}), H_({
            is_layers_redraw: !0
        }), R_()
    }

    function R_() {
        0 == Object.keys(oi).length ? sl.hide() : "none" == sl.css("display") && (sl.show(), sl.find(".sheet_btn").hide(), sl.find(".sheet_btn_" + Mo.type).show())
    }

    function H_(e) {
        var t = {};
        $.each(Bs[vo].children, function(e, _) {
            "Rect" == _.className && "undefined" != typeof _.attrs.id_sheet && (t = "undefined" == typeof oi[_.attrs.id_sheet] ? {
                color: "sheet_color",
                width: 1,
                fillEnabled: !1
            } : {
                color: "selected_element_color",
                width: 2,
                fillEnabled: !0
            }, _.setAttrs({
                stroke: mainColors[t.color],
                strokeWidth: t.width
            }))
        }), e.is_layers_redraw && to[vo].batchDraw()
    }

    function B_(e) {
        switch (e.mode) {
            case "add":
                if (0 < Object.keys(oi).length) {
                    di = {
                        type: "h_roof_columns_sheet_btn_mode_add",
                        need_layer_num: yo,
                        need_axis: {
                            g_x: Fo[vo],
                            g_y: Ao[vo],
                            current_layer_name: vo
                        },
                        slope_id: ii.attrs.id,
                        g_selected_sheets: JSON.copy(oi),
                        slope_columns_sheets: {
                            before: JSON.copy(ii.attrs.columns_sheets)
                        }
                    };
                    var t = "",
                        _ = 0;
                    $.each(ii.attrs.columns_sheets, function(a, r) {
                        for (var n = r.length - 1; 0 <= n; n--)
                            if (t = ii.attrs.id + "_col_" + a + "_sh_" + n, "undefined" != typeof oi[t]) {
                                var s = JSON.parse(JSON.stringify(ii.attrs.columns_sheets[a][n]));
                                switch (10 < Mo.wave_length ? _ = Mo.wave_length + Mo.gap_y : (_ = s.length / 2, _ += _ % 10), _ = U_(_), Mo.type) {
                                    case "mch":
                                    case "pn":
                                    case "falc":
                                    case "siding_vert":
                                        var o = {
                                            bottom: s.bottom,
                                            left: s.left,
                                            length: _,
                                            status: 1,
                                            right: s.right,
                                            top: s.bottom + _
                                        };
                                        if (ii.attrs.columns_sheets[a].splice(n, 0, o), s.top > o.top) {
                                            var i = s.top - o.top + Mo.gap_y,
                                                l = U_(i);
                                            l == i && (ii.attrs.columns_sheets[a][n + 1].length = l, ii.attrs.columns_sheets[a][n + 1].bottom = s.top - l)
                                        }
                                        break;
                                    case "siding":
                                        var o = {
                                            bottom: s.bottom,
                                            left: s.left,
                                            length: _,
                                            status: 1,
                                            right: s.left + _,
                                            top: s.top
                                        };
                                        if (ii.attrs.columns_sheets[a].splice(n, 0, o), s.right > o.right) {
                                            var i = s.right - o.right + Mo.gap_y,
                                                l = U_(i);
                                            l == i && (ii.attrs.columns_sheets[a][n + 1].length = l, ii.attrs.columns_sheets[a][n + 1].left = s.right - l)
                                        }
                                        break;
                                    case "mch_modul":
                                        switch (e.side) {
                                            case "right":
                                                var o = {
                                                    bottom: s.bottom,
                                                    left: s.right - Mo.gap_x,
                                                    length: _,
                                                    right: s.right - Mo.gap_x + Mo.sheet_width,
                                                    status: 1,
                                                    top: s.top
                                                };
                                                "undefined" == typeof ii.attrs.columns_sheets[a + 1] && (ii.attrs.columns_sheets[a + 1] = []), ii.attrs.columns_sheets[a + 1].push(o);
                                                break;
                                            case "left":
                                                var o = {
                                                    bottom: s.bottom,
                                                    left: s.left - Mo.sheet_width + Mo.gap_x,
                                                    length: _,
                                                    right: s.left + Mo.gap_x,
                                                    status: 1,
                                                    top: s.top
                                                };
                                                "undefined" == typeof ii.attrs.columns_sheets[a - 1] ? (ii.attrs.columns_sheets.splice(a, 0, [o]), a++, $.each(oi, function(e) {
                                                    let t = e.indexOf("_col_") + 5,
                                                        _ = e.indexOf("_sh_"),
                                                        a = parseInt(e.substr(t, _ - t)),
                                                        r = e.replace("_col_" + a + "_sh_", "_col_" + (a + 1) + "_sh_");
                                                    delete oi[e], oi[r] = {}
                                                })) : ii.attrs.columns_sheets[a - 1].push(o);
                                                break;
                                            default:
                                        }
                                        break;
                                    default:
                                }
                            }
                    }), B_({
                        mode: "slope_graph_final"
                    }), di.slope_columns_sheets.after = JSON.copy(ii.attrs.columns_sheets), An({
                        mode: "add",
                        element: di
                    })
                }
                break;
            case "delete":
                if (0 < Object.keys(oi).length) {
                    di = {
                        type: "h_roof_columns_sheet_btn_mode_delete",
                        need_layer_num: yo,
                        need_axis: {
                            g_x: Fo[vo],
                            g_y: Ao[vo],
                            current_layer_name: vo
                        },
                        slope_id: ii.attrs.id,
                        g_selected_sheets: JSON.copy(oi),
                        slope_columns_sheets: {
                            before: JSON.copy(ii.attrs.columns_sheets)
                        }
                    };
                    var t = "";
                    $.each(ii.attrs.columns_sheets, function(e, _) {
                        for (var a = _.length - 1; 0 <= a; a--) t = ii.attrs.id + "_col_" + e + "_sh_" + a, "undefined" != typeof oi[t] && (ii.attrs.columns_sheets[e].splice(a, 1), delete oi[t])
                    }), B_({
                        mode: "slope_graph_final"
                    }), di.slope_columns_sheets.after = JSON.copy(ii.attrs.columns_sheets), An({
                        mode: "add",
                        element: di
                    })
                }
                break;
            case "merge":
                if (Js = !1, 0 < Object.keys(oi).length) {
                    var a = {},
                        r = [];
                    $.each(oi, function(e) {
                        e = e.replace(ii.attrs.id + "_col_", ""), e = e.replace("_sh_", "_"), r = e.split("_"), r[0] = parseInt(r[0]), r[1] = parseInt(r[1]), "undefined" == typeof a["c" + r[0]] && (a["c" + r[0]] = []), a["c" + r[0]].push(r[1])
                    });
                    var n = JSON.copy(ii.attrs.columns_sheets);
                    $.each(n, function(e, t) {
                        "undefined" != typeof a["c" + e] && (n[e] = Nn(t, a["c" + e], 0))
                    }), Js && (di = {
                        type: "h_roof_columns_sheet_merge",
                        need_layer_num: yo,
                        need_tab_scale: Go.g_scale[vo],
                        need_axis: {
                            g_x: Fo[vo],
                            g_y: Ao[vo],
                            current_layer_name: vo
                        },
                        slope_id: ii.attrs.id,
                        g_selected_sheets: {},
                        slope_columns_sheets: {
                            before: JSON.copy(ii.attrs.columns_sheets)
                        }
                    }, ii.setAttrs({
                        columns_sheets: n
                    }), di.slope_columns_sheets.after = JSON.copy(ii.attrs.columns_sheets), An({
                        mode: "add",
                        element: di
                    }), B_({
                        mode: "slope_graph_final"
                    }), ae())
                }
                Js = !1;
                break;
            case "close":
                ae();
                break;
            case "slope_graph_final":
                $_(ii.id()), N_(ii), da(), to[vo].draw();
                break;
            default:
        }
    }

    function Z_(e) {
        if (0 < Object.keys(oi).length) {
            di = {
                type: "h_roof_columns_sheet_change",
                need_layer_num: yo,
                need_axis: {
                    g_x: Fo[vo],
                    g_y: Ao[vo],
                    current_layer_name: vo
                },
                slope_id: ii.attrs.id,
                g_selected_sheets: JSON.copy(oi),
                slope_columns_sheets: {
                    before: JSON.copy(ii.attrs.columns_sheets)
                }
            };
            var t = !1,
                _ = "";
            $.each(ii.attrs.columns_sheets, function(a, r) {
                $.each(r, function(r) {
                    _ = ii.attrs.id + "_col_" + a + "_sh_" + r, "undefined" != typeof oi[_] && J_(e, a, r) && (t = !0)
                })
            }), t && (di.slope_columns_sheets.after = JSON.copy(ii.attrs.columns_sheets), An({
                mode: "add",
                element: di
            }), B_({
                mode: "slope_graph_final"
            }))
        }
    }

    function J_(e, t, _) {
        var a = ii.attrs.columns_sheets[t][_].length,
            r = 0,
            n = 1,
            s = "",
            o = 1,
            i = 0;
        switch (e.param) {
            case "top_row_up":
                switch (e.value) {
                    case "wave_length":
                        r = U_(a + Mo.wave_length);
                        break;
                    default:
                        r = U_(a + e.value);
                }
                i = r - a, n = 1, s = "top", o = 1;
                break;
            case "top_row_down":
                switch (e.value) {
                    case "wave_length":
                        r = _a(a - Mo.wave_length);
                        break;
                    default:
                        r = _a(a - e.value);
                }
                i = a - r, n = -1, s = "top", o = -1;
                break;
            case "bottom_row_up":
                switch (e.value) {
                    case "wave_length":
                        r = ta(a);
                        break;
                    default:
                        r = _a(a - e.value);
                }
                i = a - r, n = -1, s = "bottom", o = 1;
                break;
            case "bottom_row_down":
                switch (e.value) {
                    case "wave_length":
                        r = ea(a);
                        break;
                    default:
                        r = U_(a + e.value);
                }
                i = r - a, n = 1, s = "bottom", o = -1;
                break;
            case "left_row_left":
                r = U_(a + e.value), i = r - a, n = 1, s = "left", o = -1;
                break;
            case "left_row_right":
                r = _a(a - e.value), i = a - r, n = -1, s = "left", o = 1;
                break;
            case "right_row_left":
                r = _a(a - e.value), i = a - r, n = -1, s = "right", o = -1;
                break;
            case "right_row_right":
                r = U_(a + e.value), i = r - a, n = 1, s = "right", o = 1;
                break;
            default:
        }
        return !!(0 < i) && (ii.attrs.columns_sheets[t][_].length += i * n, ii.attrs.columns_sheets[t][_][s] += i * o, !0)
    }

    function Q_(e) {
        return !(e < Mo.sheet_min_length_tech || e > Mo.sheet_max_length_tech) && -1 != Mo.sheet_allowed_length.indexOf(e)
    }

    function U_(e) {
        for (; e < Mo.sheet_max_length_tech;) {
            var t = Q_(e);
            if (t) return e;
            e += Mo.step
        }
        return Mo.sheet_max_length_tech
    }

    function ea(e) {
        var t = e;
        for (e += Mo.wave_length; e <= Mo.sheet_max_length_tech;) {
            var _ = Q_(e);
            if (_) return e;
            e += Mo.wave_length
        }
        return t
    }

    function ta(e) {
        var t = e;
        for (e -= Mo.wave_length; e >= Mo.sheet_min_length_tech;) {
            var _ = Q_(e);
            if (_) return e;
            e -= Mo.wave_length
        }
        return t
    }

    function _a(e) {
        for (; e > Mo.sheet_min_length_tech;) {
            var t = Q_(e);
            if (t) return e;
            e -= Mo.step
        }
        return Mo.sheet_min_length_tech
    }

    function aa(e, t) {
        var _ = e[0].attributes.id.value,
            a = 0,
            r = e[0].value + "";
        a = e.hasClass("js_cad_inp_mb_minus") ? U(r) : Math.abs(U(r));
        var n = a.toFixed(yi.length.prec);
        if (0 == Wo.settings_programm_figures_razmer.is_use_razmer_template || n != yi.length.str ? $("#" + _).val(n) : $("#" + _).val(Wo.settings_programm_figures_razmer.razmer_template), "offset" != t && "delta" != t) {
            var s = e[0].form.id,
                o = s.replace("form", ""),
                i = Vt(s, o);
            switch (Xt(s), ai = JSON.parse(JSON.stringify(ri)), _) {
                case "target_rect_a":
                case "target_rect_b":
                    break;
                case "target_triangle_a":
                case "target_triangle_b":
                case "target_triangle_c":
                case "target_triangle_h":
                case "target_triangle_a1":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_triangle_2_a":
                    break;
                case "target_triangle_2_b":
                case "target_triangle_2_c":
                    0 == a && $("#" + o + "a").val(a.toFixed(yi.length.prec)), i = ra(s, i, _, o);
                    break;
                case "target_trapec_h":
                case "target_trapec_a1":
                case "target_trapec_a":
                case "target_trapec_c":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_trapec_b":
                case "target_trapec_d":
                    break;
                case "target_paragramm_h":
                case "target_paragramm_a":
                case "target_paragramm_b":
                    "target_paragramm_a" == _ ? $("#" + o + "c").val(n) : "target_paragramm_b" == _ && $("#" + o + "d").val(n), na(s, i, o);
                    break;
                case "target_paragramm_c":
                case "target_paragramm_d":
                    break;
                case "target_trapec_2_b":
                    break;
                case "target_trapec_2_a":
                case "target_trapec_2_c":
                case "target_trapec_2_d":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_trapec_6_b":
                    break;
                case "target_trapec_6_a":
                case "target_trapec_6_c":
                case "target_trapec_6_d":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_trapec_7_d":
                    break;
                case "target_trapec_7_a":
                case "target_trapec_7_b":
                case "target_trapec_7_c":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_trapec_8_d":
                    break;
                case "target_trapec_8_a":
                case "target_trapec_8_b":
                case "target_trapec_8_c":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_gun_3_f":
                    break;
                case "target_gun_3_a":
                case "target_gun_3_b":
                case "target_gun_3_c":
                case "target_gun_3_d":
                case "target_gun_3_e":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_air_ex_a":
                case "target_air_ex_b":
                case "target_air_ex_c":
                case "target_air_ex_d":
                    na(s, i, o);
                    break;
                case "target_porch_a":
                case "target_porch_b":
                case "target_porch_c":
                case "target_porch_e":
                case "target_porch_f":
                    "target_porch_b" == _ ? $("#" + o + "d").val(n) : "target_porch_f" == _ && $("#" + o + "h").val(n), i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_porch_d":
                case "target_porch_g":
                case "target_porch_h":
                    break;
                case "target_home_a":
                case "target_home_b":
                case "target_home_h":
                    "target_home_b" == _ && $("#" + o + "e").val(n), i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_home_c":
                case "target_home_d":
                case "target_home_e":
                    break;
                case "target_home_2_h":
                case "target_home_2_a":
                case "target_home_2_b":
                case "target_home_2_c":
                case "target_home_2_d":
                    "target_home_2_b" == _ ? $("#" + o + "f").val(n) : "target_home_2_c" == _ && $("#" + o + "e").val(n), i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_home_2_e":
                case "target_home_2_f":
                    break;
                case "target_hill_a":
                case "target_hill_b":
                case "target_hill_c":
                case "target_hill_d":
                case "target_hill_e":
                    na(s, i, o);
                    break;
                case "target_nest_a":
                case "target_nest_b":
                case "target_nest_c":
                case "target_nest_e":
                case "target_nest_f":
                case "target_nest_g":
                case "target_nest_h":
                    "target_nest_b" == _ && $("#" + o + "d").val(n), i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_nest_d":
                    break;
                case "target_nest_2_h":
                case "target_nest_2_a1":
                case "target_nest_2_a":
                case "target_nest_2_c":
                case "target_nest_2_e":
                case "target_nest_2_l":
                case "target_nest_2_f":
                case "target_nest_2_g":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_nest_2_b":
                case "target_nest_2_d":
                    break;
                case "target_corner_a":
                case "target_corner_b":
                case "target_corner_c":
                case "target_corner_d":
                    na(s, i, o);
                    break;
                case "target_trapec_3_h":
                case "target_trapec_3_a1":
                case "target_trapec_3_a":
                case "target_trapec_3_c":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_trapec_3_b":
                case "target_trapec_3_d":
                    break;
                case "target_hill_2_a":
                case "target_hill_2_b":
                case "target_hill_2_c":
                case "target_hill_2_d":
                case "target_hill_2_e":
                case "target_hill_2_f":
                    na(s, i, o);
                    break;
                case "target_corner_2_a":
                case "target_corner_2_b":
                case "target_corner_2_c":
                case "target_corner_2_d":
                    na(s, i, o);
                    break;
                case "target_gun_a":
                case "target_gun_b":
                case "target_gun_c":
                case "target_gun_d":
                case "target_gun_e":
                    na(s, i, o);
                    break;
                case "target_gun_2_a":
                case "target_gun_2_b":
                case "target_gun_2_c":
                case "target_gun_2_d":
                case "target_gun_2_e":
                    na(s, i, o);
                    break;
                case "target_goose_a":
                case "target_goose_b":
                case "target_goose_c":
                case "target_goose_d":
                case "target_goose_e":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_home_4_a":
                case "target_home_4_b":
                case "target_home_4_c":
                case "target_home_4_h":
                case "target_home_4_h1":
                case "target_home_4_a1":
                    "target_home_4_b" == _ && $("#" + o + "e").val(n), "target_home_4_c" == _ && $("#" + o + "d").val(n), i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_nest_3_a":
                case "target_nest_3_b":
                case "target_nest_3_c":
                case "target_nest_3_d":
                case "target_nest_3_e":
                case "target_nest_3_h":
                    na(s, i, o);
                    break;
                case "target_hill_3_a":
                case "target_hill_3_b":
                case "target_hill_3_c":
                case "target_hill_3_L":
                case "target_hill_3_h1":
                case "target_hill_3_h2":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_hill_4_a":
                case "target_hill_4_b":
                case "target_hill_4_c":
                case "target_hill_4_L":
                case "target_hill_4_h1":
                case "target_hill_4_h2":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_nest_4_a":
                case "target_nest_4_a1":
                case "target_nest_4_c":
                case "target_nest_4_e":
                case "target_nest_4_f":
                case "target_nest_4_g":
                case "target_nest_4_j":
                case "target_nest_4_L":
                    "target_nest_4_f" == _ && $("#" + o + "i").val(n), "target_nest_4_g" == _ && $("#" + o + "h").val(n), i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_home_3_a":
                case "target_home_3_b":
                case "target_home_3_H":
                case "target_home_3_L":
                    "target_home_3_b" == _ && $("#" + o + "g").val(n), i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_horn_a":
                case "target_horn_b":
                case "target_horn_h":
                case "target_horn_h1":
                    na(s, i, o);
                    break;
                case "target_vase_a":
                case "target_vase_b":
                case "target_vase_c":
                case "target_vase_d":
                case "target_vase_h":
                case "target_vase_h1":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_triangle_3_b":
                    break;
                case "target_triangle_3_a":
                case "target_triangle_3_c":
                    0 == a && $("#" + o + "b").val(a.toFixed(yi.length.prec)), i = ra(s, i, _, o);
                    break;
                case "target_triangle_4_c":
                    break;
                case "target_triangle_4_a":
                case "target_triangle_4_b":
                    0 == a && $("#" + o + "c").val(a.toFixed(yi.length.prec)), i = ra(s, i, _, o);
                    break;
                case "target_triangle_5_c":
                    break;
                case "target_triangle_5_a":
                case "target_triangle_5_b":
                    0 == a && $("#" + o + "c").val(a.toFixed(yi.length.prec)), i = ra(s, i, _, o);
                    break;
                case "target_trapec_4_h":
                case "target_trapec_4_a":
                case "target_trapec_4_a1":
                case "target_trapec_4_d":
                case "target_trapec_4_e":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_trapec_5_h":
                case "target_trapec_5_a":
                case "target_trapec_5_a1":
                case "target_trapec_5_c":
                case "target_trapec_5_d":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_train_1_a":
                case "target_train_1_b":
                case "target_train_1_c":
                case "target_train_1_d":
                case "target_train_1_e":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_train_2_a":
                case "target_train_2_c":
                case "target_train_2_d":
                case "target_train_2_e":
                case "target_train_2_f":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_paragramm_2_a":
                case "target_paragramm_2_b":
                case "target_paragramm_2_c":
                case "target_paragramm_2_d":
                case "target_paragramm_2_h":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_paragramm_3_a":
                case "target_paragramm_3_b":
                case "target_paragramm_3_c":
                case "target_paragramm_3_d":
                case "target_paragramm_3_h":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_wigwam_a":
                case "target_wigwam_b":
                case "target_wigwam_c":
                case "target_wigwam_h":
                case "target_wigwam_h2":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_tank_a":
                case "target_tank_c":
                case "target_tank_a1":
                case "target_tank_a2":
                case "target_tank_h1":
                case "target_tank_h2":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_tank_2_a":
                case "target_tank_2_c":
                case "target_tank_2_a1":
                case "target_tank_2_a2":
                case "target_tank_2_h1":
                case "target_tank_2_h2":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_ftable_a":
                case "target_ftable_b":
                case "target_ftable_c":
                case "target_ftable_d":
                case "target_ftable_e":
                case "target_ftable_f":
                case "target_ftable_g":
                case "target_ftable_h":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_hill_5_a":
                case "target_hill_5_b":
                case "target_hill_5_c":
                case "target_hill_5_d":
                case "target_hill_5_e":
                case "target_hill_5_f":
                case "target_hill_5_g":
                case "target_hill_5_h1":
                case "target_hill_5_h2":
                case "target_hill_5_h3":
                case "target_hill_5_L1":
                case "target_hill_5_L2":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_hill_6_a":
                case "target_hill_6_b":
                case "target_hill_6_c":
                case "target_hill_6_h1":
                case "target_hill_6_h2":
                case "target_hill_6_L":
                case "target_hill_6_L1":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                case "target_nest_5_a":
                case "target_nest_5_b":
                case "target_nest_5_c":
                case "target_nest_5_d":
                case "target_nest_5_e":
                case "target_nest_5_f":
                case "target_nest_5_g":
                case "target_nest_5_h":
                case "target_nest_5_i":
                case "target_nest_5_j":
                case "target_nest_5_L1":
                    i = ra(s, i, _, o), na(s, i, o);
                    break;
                default:
            }
            0 < ai.errors.length && Qt(s, ai), 1 == Wo.settings_programm_figures_razmer.is_use_razmer_template && $.each($("#" + s).find("input[type=\"text\"]"), function(e, t) {
                $(t).val() == yi.length.str && $(t).val(Wo.settings_programm_figures_razmer.razmer_template)
            })
        }
    }

    function ra(e, t, _, a) {
        _.replace(a, "");
        switch (e) {
            case "target_triangle_form":
                if (-1 == ["target_triangle_a", "target_triangle_b", "target_triangle_c"].indexOf(_) || $("#" + a + "a").prop("disabled") || $("#" + a + "b").prop("disabled") || $("#" + a + "c").prop("disabled") || (0 != t.h || 0 != t.a1) && (!$("#" + a + "h").prop("disabled") || !$("#" + a + "a1").prop("disabled"))) - 1 == ["target_triangle_a1", "target_triangle_b", "target_triangle_c"].indexOf(_) || $("#" + a + "a1").prop("disabled") || $("#" + a + "b").prop("disabled") || $("#" + a + "c").prop("disabled") || 0 != t.h || 0 != t.a ? -1 == ["target_triangle_b", "target_triangle_c", "target_triangle_h"].indexOf(_) || $("#" + a + "b").prop("disabled") || $("#" + a + "c").prop("disabled") || $("#" + a + "h").prop("disabled") || 0 != t.a || 0 != t.a1 ? -1 == ["target_triangle_a", "target_triangle_a1", "target_triangle_h"].indexOf(_) || $("#" + a + "a").prop("disabled") || $("#" + a + "a1").prop("disabled") || $("#" + a + "h").prop("disabled") || 0 != t.b || 0 != t.c ? -1 == ["target_triangle_a", "target_triangle_b", "target_triangle_h"].indexOf(_) || $("#" + a + "a").prop("disabled") || $("#" + a + "b").prop("disabled") || $("#" + a + "h").prop("disabled") || (0 != t.a1 || 0 != t.c) && (!$("#" + a + "a1").prop("disabled") || !$("#" + a + "c").prop("disabled")) ? -1 == ["target_triangle_a", "target_triangle_c", "target_triangle_h"].indexOf(_) || $("#" + a + "a").prop("disabled") || $("#" + a + "c").prop("disabled") || $("#" + a + "h").prop("disabled") || (0 != t.a1 || 0 != t.b) && (!$("#" + a + "a1").prop("disabled") || !$("#" + a + "b").prop("disabled")) || (0 < t.a && 0 < t.c && 0 < t.h ? (t["a-a1"] = Math.sqrt(t.c * t.c - t.h * t.h), t.a1 = t.a - t["a-a1"], t.b = Math.sqrt(t.a1 * t.a1 + t.h * t.h), isNaN(t.a1) && (t.a1 = 0), isNaN(t.b) && (t.b = 0), $("#" + a + "a1").val(t.a1.toFixed(yi.length.prec)), $("#" + a + "b").val(t.b.toFixed(yi.length.prec)), $("#" + a + "h").prop("disabled", !1), $("#" + a + "b").prop("disabled", !0), $("#" + a + "c").prop("disabled", !1), $("#" + a + "a").prop("disabled", !1), $("#" + a + "a1").prop("disabled", !0)) : $("#" + a + "a1").prop("disabled") && $("#" + a + "b").prop("disabled") && ($("#" + a + "a1").val(yi.length.str), $("#" + a + "b").val(yi.length.str))) : 0 < t.a && 0 < t.b && 0 < t.h ? (t.a1 = Math.sqrt(t.b * t.b - t.h * t.h), t.c = Math.sqrt((t.a - t.a1) * (t.a - t.a1) + t.h * t.h), isNaN(t.a1) && (t.a1 = 0), isNaN(t.c) && (t.c = 0), $("#" + a + "a1").val(t.a1.toFixed(yi.length.prec)), $("#" + a + "c").val(t.c.toFixed(yi.length.prec)), $("#" + a + "h").prop("disabled", !1), $("#" + a + "b").prop("disabled", !1), $("#" + a + "c").prop("disabled", !0), $("#" + a + "a").prop("disabled", !1), $("#" + a + "a1").prop("disabled", !0)) : $("#" + a + "a1").prop("disabled") && $("#" + a + "c").prop("disabled") && ($("#" + a + "a1").val(yi.length.str), $("#" + a + "c").val(yi.length.str)) : 0 < t.a && 0 != t.a1 && 0 < t.h ? (t.b = Math.sqrt(t.a1 * t.a1 + t.h * t.h), t.c = Math.sqrt((t.a - t.a1) * (t.a - t.a1) + t.h * t.h), isNaN(t.b) && (t.b = 0), isNaN(t.c) && (t.c = 0), $("#" + a + "b").val(t.b.toFixed(yi.length.prec)), $("#" + a + "c").val(t.c.toFixed(yi.length.prec)), $("#" + a + "h").prop("disabled", !1), $("#" + a + "b").prop("disabled", !0), $("#" + a + "c").prop("disabled", !0), $("#" + a + "a").prop("disabled", !1), $("#" + a + "a1").prop("disabled", !1)) : $("#" + a + "b").prop("disabled") && $("#" + a + "c").prop("disabled") && ($("#" + a + "b").val(yi.length.str), $("#" + a + "c").val(yi.length.str)) : 0 < t.h && 0 < t.b && 0 < t.c ? (t.a1 = Math.sqrt(t.b * t.b - t.h * t.h), t.a = Math.sqrt(t.c * t.c - t.h * t.h) + t.a1, isNaN(t.a1) && (t.a1 = 0), isNaN(t.a) && (t.a = 0), $("#" + a + "a1").val(t.a1.toFixed(yi.length.prec)), $("#" + a + "a").val(t.a.toFixed(yi.length.prec)), $("#" + a + "h").prop("disabled", !1), $("#" + a + "b").prop("disabled", !1), $("#" + a + "c").prop("disabled", !1), $("#" + a + "a").prop("disabled", !0), $("#" + a + "a1").prop("disabled", !0)) : $("#" + a + "a").prop("disabled") && $("#" + a + "a1").prop("disabled") && ($("#" + a + "a").val(yi.length.str), $("#" + a + "a1").val(yi.length.str)) : 0 < t.a1 && 0 < t.b && 0 < t.c ? (t.h = Math.sqrt(t.b * t.b - t.a1 * t.a1), isNaN(t.h) && (t.h = 0), t.a = 0 < t.h ? Math.sqrt(t.c * t.c - t.h * t.h) + t.a1 : 0, isNaN(t.a) && (t.a = 0), $("#" + a + "h").val(t.h.toFixed(yi.length.prec)), $("#" + a + "a").val(t.a.toFixed(yi.length.prec)), $("#" + a + "a1").prop("disabled", !1), $("#" + a + "b").prop("disabled", !1), $("#" + a + "c").prop("disabled", !1), $("#" + a + "h").prop("disabled", !0), $("#" + a + "a").prop("disabled", !0)) : $("#" + a + "a").prop("disabled") && $("#" + a + "h").prop("disabled") && ($("#" + a + "h").val(yi.length.str), $("#" + a + "a").val(yi.length.str));
                else if (0 < t.a && 0 < t.b && 0 < t.c) {
                    var r = (t.a + t.b + t.c) / 2;
                    t.h = 2 * Math.sqrt(r * (r - t.a) * (r - t.b) * (r - t.c)) / t.a, t.a1 = Math.sqrt(t.b * t.b - t.h * t.h), t.b < t.c && t.c * t.c > t.a * t.a + t.h * t.h && (t.a1 *= -1), isNaN(t.h) && (t.h = 0), isNaN(t.a1) && (t.a1 = 0), $("#" + a + "h").val(t.h.toFixed(yi.length.prec)), $("#" + a + "a1").val(t.a1.toFixed(yi.length.prec)), $("#" + a + "a").prop("disabled", !1), $("#" + a + "b").prop("disabled", !1), $("#" + a + "c").prop("disabled", !1), $("#" + a + "h").prop("disabled", !0), $("#" + a + "a1").prop("disabled", !0)
                } else $("#" + a + "a1").prop("disabled") && $("#" + a + "h").prop("disabled") && ($("#" + a + "h").val(yi.length.str), $("#" + a + "a1").val(yi.length.str));
                break;
            case "target_triangle_2_form":
                0 < t.b && 0 < t.c && (t.a = Math.sqrt(t.b * t.b + t.c * t.c), $("#" + a + "a").val(t.a.toFixed(yi.length.prec)));
                break;
            case "target_trapec_form":
                t.b = 0 < t.h && 0 < t.a1 ? Math.sqrt(t.h * t.h + t.a1 * t.a1) : 0, $("#" + a + "b").val(t.b.toFixed(yi.length.prec)), 0 < t.h && 0 < t.a1 && 0 < t.a && 0 < t.c ? (t.a1 + t.c >= t.a ? t.d = 0 : (t.a1_2 = t.a - t.a1 - t.c, t.d = Math.sqrt(t.h * t.h + t.a1_2 * t.a1_2)), $("#" + a + "d").val(t.d.toFixed(yi.length.prec))) : $("#" + a + "d").val(yi.length.str);
                break;
            case "target_trapec_2_form":
                0 < t.a && 0 < t.c && 0 < t.d ? (t.c_a = t.c - t.a, t.b = 0 < t.c_a ? Math.sqrt(t.c_a * t.c_a + t.d * t.d) : 0, $("#" + a + "b").val(t.b.toFixed(yi.length.prec))) : $("#" + a + "b").val(yi.length.str);
                break;
            case "target_trapec_6_form":
                0 < t.a && 0 < t.c && 0 < t.d ? (t.a_c = t.a - t.c, t.b = 0 < t.a_c ? Math.sqrt(t.a_c * t.a_c + t.d * t.d) : 0, $("#" + a + "b").val(t.b.toFixed(yi.length.prec))) : $("#" + a + "b").val(yi.length.str);
                break;
            case "target_trapec_7_form":
                0 < t.a && 0 < t.b && 0 < t.c ? (t.a_c = t.a - t.c, t.d = 0 < t.a_c ? Math.sqrt(t.a_c * t.a_c + t.b * t.b) : 0, $("#" + a + "d").val(t.d.toFixed(yi.length.prec))) : $("#" + a + "d").val(yi.length.str);
                break;
            case "target_trapec_8_form":
                0 < t.a && 0 < t.b && 0 < t.c ? (t.c_a = t.c - t.a, t.d = 0 < t.c_a ? Math.sqrt(t.c_a * t.c_a + t.b * t.b) : 0, $("#" + a + "d").val(t.d.toFixed(yi.length.prec))) : $("#" + a + "d").val(yi.length.str);
                break;
            case "target_gun_3_form":
                0 < t.a && 0 < t.b && 0 < t.c && 0 < t.d && 0 < t.e ? (t["a+c"] = t.a + t.c, t["b+d"] = t.b + t.d, t["a+c-e"] = t["a+c"] - t.e, t.f = 0 < t["a+c-e"] ? Math.sqrt(t["a+c-e"] * t["a+c-e"] + t["b+d"] * t["b+d"]) : 0, $("#" + a + "f").val(t.f.toFixed(yi.length.prec))) : $("#" + a + "f").val(yi.length.str);
                break;
            case "target_porch_form":
                0 < t.a && 0 < t.c && 0 < t.e ? (t.g = t.c - (t.a + t.e), $("#" + a + "g").val(t.g.toFixed(yi.length.prec))) : $("#" + a + "g").val(yi.length.str);
                break;
            case "target_home_form":
                0 < t.a && 0 < t.b && 0 < t.h ? (t.a_l = t.a / 2, t.h_t = t.h - t.b, t.c = Math.sqrt(t.a_l * t.a_l + t.h_t * t.h_t), t.d = t.c, $("#" + a + "c").val(t.c.toFixed(yi.length.prec)), $("#" + a + "d").val(t.d.toFixed(yi.length.prec))) : ($("#" + a + "c").val(yi.length.str), $("#" + a + "d").val(yi.length.str));
                break;
            case "target_home_2_form":
                0 < t.h && !$("#" + a + "h").prop("disabled") ? $("#" + a + "c").prop("disabled", !0) : $("#" + a + "c").prop("disabled", !1), 0 < t.c && !$("#" + a + "c").prop("disabled") ? $("#" + a + "h").prop("disabled", !0) : $("#" + a + "h").prop("disabled", !1), 0 < t.a && 0 < t.b && 0 < t.c && 0 < t.d ? (t.a1 = (t.a - t.d) / 2, t.h = t.b + Math.sqrt(t.c * t.c - t.a1 * t.a1), $("#" + a + "h").val(t.h.toFixed(yi.length.prec)), t.a <= t.d && $("#" + a + "h").val(yi.length.str)) : 0 < t.h && 0 < t.a && 0 < t.b && 0 < t.d && (t.a1 = (t.a - t.d) / 2, t.h1 = t.h - t.b, t.c = Math.sqrt(t.a1 * t.a1 + t.h1 * t.h1), $("#" + a + "c").val(t.c.toFixed(yi.length.prec)), t.h <= t.b && $("#" + a + "c").val(yi.length.str)), 0 < t.c ? (t.e = t.c, $("#" + a + "e").val(t.e.toFixed(yi.length.prec))) : (t.e = 0, $("#" + a + "e").val(yi.length.str));
                break;
            case "target_nest_form":
                if (-1 != ["target_nest_b", "target_nest_h"].indexOf(_) && 0 < t.b && 0 < t.h && !$("#" + a + "b").prop("disabled") && !$("#" + a + "h").prop("disabled") && ($("#" + a + "f").prop("disabled", !0), $("#" + a + "g").prop("disabled", !0)), -1 != ["target_nest_f", "target_nest_g"].indexOf(_) && (0 < t.f || 0 < t.g) && $("#" + a + "h").prop("disabled", !0), 0 < t.a && 0 < t.b && 0 < t.c && 0 < t.e && 0 < t.h && !$("#" + a + "h").prop("disabled")) t["b-h"] = t.b - t.h, t.a1 = (t.c - t.a - t.e) / 2, t.g = Math.sqrt(t["b-h"] * t["b-h"] + t.a1 * t.a1), t.f = t.g, $("#" + a + "g").val(t.g.toFixed(yi.length.prec)), $("#" + a + "f").val(t.f.toFixed(yi.length.prec)), $("#" + a + "g").prop("disabled", !0), $("#" + a + "f").prop("disabled", !0);
                else if (0 < t.a && 0 < t.b && 0 < t.c && 0 < t.e && 0 < t.f && 0 < t.g && !$("#" + a + "f").prop("disabled") && !$("#" + a + "g").prop("disabled") && (t.ae = t.c - t.a - t.e, 0 < t.ae && t.ae + t.g > t.f && t.ae + t.f > t.g && t.g + t.f > t.ae)) {
                    var r = (t.ae + t.g + t.f) / 2;
                    t["b-h"] = 2 * Math.sqrt(r * (r - t.ae) * (r - t.g) * (r - t.f)) / t.ae, t.h = t.b - t["b-h"], $("#" + a + "h").val(t.h.toFixed(yi.length.prec)), $("#" + a + "h").prop("disabled", !0)
                }
                break;
            case "target_nest_2_form":
                if (t.b = 0 < t.h && 0 < t.a1 ? Math.sqrt(t.a1 * t.a1 + t.h * t.h) : 0, $("#" + a + "b").val(t.b.toFixed(yi.length.prec)), 0 < t.a && 0 < t.l && 0 < t.e && 0 < t.a1 && 0 < t.c) {
                    var n = t.a + t.l + t.e - t.a1 - t.c;
                    t.d = 0 <= n ? Math.sqrt(n * n + t.h * t.h) : 0
                } else t.d = 0;
                $("#" + a + "d").val(t.d.toFixed(yi.length.prec));
                break;
            case "target_trapec_3_form":
                t.b = 0 < t.h && 0 < t.a1 ? Math.sqrt(t.h * t.h + t.a1 * t.a1) : 0, $("#" + a + "b").val(t.b.toFixed(yi.length.prec)), 0 < t.h && 0 < t.a1 && 0 < t.a && 0 < t.c ? (t.a1 + t.a >= t.c ? t.d = 0 : (t.a1_2 = t.c - t.a - t.a1, t.d = Math.sqrt(t.h * t.h + t.a1_2 * t.a1_2)), $("#" + a + "d").val(t.d.toFixed(yi.length.prec))) : $("#" + a + "d").val(yi.length.str);
                break;
            case "target_goose_form":
                0 < t.a && 0 < t.b && 0 < t.d && 0 < t.e ? (t["d-a"] = t.d - t.a, t["e-b"] = t.e - t.b, t.c = Math.sqrt(t["d-a"] * t["d-a"] + t["e-b"] * t["e-b"]), $("#" + a + "c").val(t.c.toFixed(yi.length.prec))) : $("#" + a + "c").val(yi.length.str);
                break;
            case "target_home_4_form":
                -1 == ["target_home_4_a", "target_home_4_b", "target_home_4_c", "target_home_4_h1"].indexOf(_) || $("#" + a + "a").prop("disabled") || $("#" + a + "b").prop("disabled") || $("#" + a + "c").prop("disabled") || $("#" + a + "h1").prop("disabled") ? -1 != ["target_home_4_a", "target_home_4_h", "target_home_4_h1", "target_home_4_a1"].indexOf(_) && !$("#" + a + "a").prop("disabled") && !$("#" + a + "h").prop("disabled") && !$("#" + a + "h1").prop("disabled") && !$("#" + a + "a1").prop("disabled") && 0 < t.a && 0 < t.h && 0 < t.h1 && 0 < t.a1 && (t["a/2"] = t.a / 2, t["h-h1"] = t.h - t.h1, t["a/2"] > t.a1 && t.h > t.h1 && (t.b = Math.sqrt(t.h1 * t.h1 + t.a1 * t.a1), t["a-a1"] = t.a - t.a1, t.c = Math.sqrt(t["a-a1"] * t["a-a1"] + t["h-h1"] * t["h-h1"]), $("#" + a + "b").val(t.b.toFixed(yi.length.prec)), $("#" + a + "c").val(t.c.toFixed(yi.length.prec)), $("#" + a + "d").val(t.c.toFixed(yi.length.prec)), $("#" + a + "e").val(t.b.toFixed(yi.length.prec)), $("#" + a + "b").prop("disabled", !0), $("#" + a + "c").prop("disabled", !0), $("#" + a + "d").prop("disabled", !0), $("#" + a + "e").prop("disabled", !0))) : 0 < t.a && 0 < t.b && 0 < t.c && 0 < t.h1 && t.b > t.h1 && (t.a1 = Math.sqrt(t.b * t.b - t.h1 * t.h1), t["a/2"] = t.a / 2, t["a/2"] > t.a1 && (t.a2 = t["a/2"] - t.a1, t.c > t.a2 ? (t.h_top = Math.sqrt(t.c * t.c - t.a2 * t.a2), t.h = t.h1 + t.h_top, $("#" + a + "a1").val(t.a1.toFixed(yi.length.prec)), $("#" + a + "h").val(t.h.toFixed(yi.length.prec)), $("#" + a + "a1").prop("disabled", !0), $("#" + a + "h").prop("disabled", !0)) : ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 <b>c</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F <b>a/2 - a1</b>")));
                break;
            case "target_nest_3_form":
                break;
            case "target_hill_3_form":
            case "target_hill_4_form":
                var s = "";
                switch (e) {
                    case "target_hill_3_form":
                        s = "hill_3";
                        break;
                    case "target_hill_4_form":
                        s = "hill_4";
                        break;
                    default:
                } - 1 != ["target_" + s + "_a", "target_" + s + "_b", "target_" + s + "_c", "target_" + s + "_h1", "target_" + s + "_h2"].indexOf(_) && !$("#" + a + "b").prop("disabled") && !$("#" + a + "c").prop("disabled") && 0 < t.a && 0 < t.b && 0 < t.c ? (t.L = (t.a - t.b - t.c) / 2, $("#" + a + "L").val(t.L.toFixed(yi.length.prec)), $("#" + a + "L").prop("disabled", !0), 0 < t.L ? 0 < t.h1 && 0 < t.h2 && t.h1 > t.h2 ? (t.L2 = t.L * t.h2 / t.h1, t.L1 = t.L - t.L2, $("#" + a + "L1").val(t.L1.toFixed(yi.length.prec)), $("#" + a + "L2").val(t.L2.toFixed(yi.length.prec))) : ($("#" + a + "L1").val(yi.length.str), $("#" + a + "L2").val(yi.length.str)) : ($("#" + a + "L1").val(yi.length.str), $("#" + a + "L2").val(yi.length.str))) : -1 != ["target_" + s + "_a", "target_" + s + "_b", "target_" + s + "_L", "target_" + s + "_h1", "target_" + s + "_h2"].indexOf(_) && !$("#" + a + "b").prop("disabled") && !$("#" + a + "L").prop("disabled") && 0 < t.a && 0 < t.b && 0 < t.L ? (t.c = t.a - t.b - t.L - t.L, $("#" + a + "c").val(t.c.toFixed(yi.length.prec)), $("#" + a + "c").prop("disabled", !0), 0 < t.c ? 0 < t.h1 && 0 < t.h2 && t.h1 > t.h2 ? (t.L2 = t.L * t.h2 / t.h1, t.L1 = t.L - t.L2, $("#" + a + "L1").val(t.L1.toFixed(yi.length.prec)), $("#" + a + "L2").val(t.L2.toFixed(yi.length.prec))) : ($("#" + a + "L1").val(yi.length.str), $("#" + a + "L2").val(yi.length.str)) : ($("#" + a + "L1").val(yi.length.str), $("#" + a + "L2").val(yi.length.str))) : -1 != ["target_" + s + "_a", "target_" + s + "_c", "target_" + s + "_L", "target_" + s + "_h1", "target_" + s + "_h2"].indexOf(_) && !$("#" + a + "c").prop("disabled") && !$("#" + a + "L").prop("disabled") && 0 < t.a && 0 < t.c && 0 < t.L && (t.b = t.a - t.c - t.L - t.L, $("#" + a + "b").val(t.b.toFixed(yi.length.prec)), $("#" + a + "b").prop("disabled", !0), 0 < t.b ? 0 < t.h1 && 0 < t.h2 && t.h1 > t.h2 ? (t.L2 = t.L * t.h2 / t.h1, t.L1 = t.L - t.L2, $("#" + a + "L1").val(t.L1.toFixed(yi.length.prec)), $("#" + a + "L2").val(t.L2.toFixed(yi.length.prec))) : ($("#" + a + "L1").val(yi.length.str), $("#" + a + "L2").val(yi.length.str)) : ($("#" + a + "L1").val(yi.length.str), $("#" + a + "L2").val(yi.length.str))), $("#" + a + "L").prop("disabled") && (0 >= t.a || 0 >= t.b || 0 >= t.c) ? (t.L = 0, t.L1 = 0, t.L2 = 0, $("#" + a + "L").val(yi.length.str), $("#" + a + "L1").val(yi.length.str), $("#" + a + "L2").val(yi.length.str)) : $("#" + a + "c").prop("disabled") && (0 >= t.a || 0 >= t.b || 0 >= t.L) ? (t.c = 0, t.L1 = 0, t.L2 = 0, $("#" + a + "c").val(yi.length.str), $("#" + a + "L1").val(yi.length.str), $("#" + a + "L2").val(yi.length.str)) : $("#" + a + "b").prop("disabled") && (0 >= t.a || 0 >= t.c || 0 >= t.L) && (t.b = 0, t.L1 = 0, t.L2 = 0, $("#" + a + "b").val(yi.length.str), $("#" + a + "L1").val(yi.length.str), $("#" + a + "L2").val(yi.length.str));
                break;
            case "target_nest_4_form":
                0 < t.a1 && 0 < t.L ? (t.b = Math.sqrt(t.a1 * t.a1 + t.L * t.L), $("#" + a + "b").val(t.b.toFixed(yi.length.prec))) : $("#" + a + "b").val(yi.length.str), 0 < t.j && (t["05_j"] = t.j / 2), 0 < t.j && 0 < t.f && 0 < t.g ? t.g > t["05_j"] ? (t.f2 = Math.sqrt(t.g * t.g - t["05_j"] * t["05_j"]), t.L1 = t.f + t.f2, $("#" + a + "L1").val(t.L1.toFixed(yi.length.prec))) : $("#" + a + "L1").val(yi.length.str) : $("#" + a + "L1").val(yi.length.str), 0 < t.L && 0 < t.a && 0 < t.j && 0 < t.e && 0 < t.a1 && 0 < t.c ? t.a + t.j + t.e > t.a1 + t.c ? (t.a2 = t.a + t.j + t.e - t.a1 - t.c, t.d = Math.sqrt(t.L * t.L + t.a2 * t.a2), $("#" + a + "a2").val(t.a2.toFixed(yi.length.prec)), $("#" + a + "d").val(t.d.toFixed(yi.length.prec))) : ($("#" + a + "a2").val(yi.length.str), $("#" + a + "d").val(yi.length.str)) : ($("#" + a + "a2").val(yi.length.str), $("#" + a + "d").val(yi.length.str));
                break;
            case "target_home_3_form":
                0 < t.L && 0 < t.a && t.L > t.a ? (t.c = (t.L - t.a) / 2, t.f = t.c, $("#" + a + "c").val(t.c.toFixed(yi.length.prec)), $("#" + a + "f").val(t.f.toFixed(yi.length.prec))) : (t.c = 0, t.f = 0, $("#" + a + "c").val(yi.length.str), $("#" + a + "f").val(yi.length.str)), 0 < t.L && 0 < t.a && 0 < t.H && 0 < t.b && t.L > t.a && t.H > t.b ? (t["a/2"] = t.a / 2, t["a/2+c"] = t["a/2"] + t.c, t["H-b"] = t.H - t.b, t.d = Math.sqrt(t["H-b"] * t["H-b"] + t["a/2+c"] * t["a/2+c"]), t.e = t.d, $("#" + a + "d").val(t.d.toFixed(yi.length.prec)), $("#" + a + "e").val(t.e.toFixed(yi.length.prec))) : (t.d = 0, t.e = 0, $("#" + a + "d").val(yi.length.str), $("#" + a + "e").val(yi.length.str));
                break;
            case "target_horn_form":
                break;
            case "target_vase_form":
                0 < t.a && 0 < t.c && 0 < t.d ? (t["(c-a)/2"] = (t.c - t.a) / 2, t.d > t["(c-a)/2"] ? (t.h1 = Math.sqrt(t.d * t.d - t["(c-a)/2"] * t["(c-a)/2"]), $("#" + a + "h1").val(t.h1.toFixed(yi.length.prec))) : $("#" + a + "h1").val(yi.length.str)) : $("#" + a + "h1").val(yi.length.str);
                break;
            case "target_triangle_3_form":
                0 < t.a && 0 < t.c && (t.b = Math.sqrt(t.a * t.a + t.c * t.c), $("#" + a + "b").val(t.b.toFixed(yi.length.prec)));
                break;
            case "target_triangle_4_form":
                0 < t.a && 0 < t.b && (t.c = Math.sqrt(t.a * t.a + t.b * t.b), $("#" + a + "c").val(t.c.toFixed(yi.length.prec)));
                break;
            case "target_triangle_5_form":
                0 < t.a && 0 < t.b && (t.c = Math.sqrt(t.a * t.a + t.b * t.b), $("#" + a + "c").val(t.c.toFixed(yi.length.prec)));
                break;
            case "target_trapec_4_form":
            case "target_trapec_5_form":
                var o = {
                        target_trapec_4_form: {
                            fb: "f",
                            e1c1: "e1",
                            bf: "b",
                            ce: "c",
                            b1f1: "b1",
                            c1e1: "c1",
                            ec: "e"
                        },
                        target_trapec_5_form: {
                            fb: "b",
                            e1c1: "c1",
                            bf: "f",
                            ce: "e",
                            b1f1: "f1",
                            c1e1: "e1",
                            ec: "c"
                        }
                    },
                    i = o[e];
                t[i.fb] = 0 < t.h && 0 < t.a1 ? Math.sqrt(t.h * t.h + t.a1 * t.a1) : 0, $("#" + a + i.fb).val(t[i.fb].toFixed(yi.length.prec)), t[i.e1c1] = 0 < t.a && 0 < t.a1 ? t.a - 2 * t.a1 : 0, $("#" + a + i.e1c1).val(t[i.e1c1].toFixed(yi.length.prec)), t.h1 = 0 < t.h && 0 < t.d ? t.h - t.d : 0, $("#" + a + "h1").val(t.h1.toFixed(yi.length.prec)), t[i.bf] = 0 < t[i.fb] && 0 < t.h && 0 < t.h1 ? t[i.fb] * t.h1 / t.h : 0, $("#" + a + i.bf).val(t[i.bf].toFixed(yi.length.prec)), t[i.ce] = 0, 0 < t[i.fb] && 0 < t[i.bf] && t[i.fb] > t[i.bf] && (t[i.b1f1] = t[i.fb] - t[i.bf], 0 < t.d && t[i.b1f1] > t.d && (t[i.c1e1] = Math.sqrt(t[i.b1f1] * t[i.b1f1] - t.d * t.d), 0 < t[i.ec] && 0 < t[i.e1c1] && (t[i.ce] = t[i.ec] - t[i.e1c1] - t[i.c1e1]))), $("#" + a + i.ce).val(t[i.ce].toFixed(yi.length.prec));
                break;
            case "target_train_1_form":
            case "target_train_2_form":
                var o = {
                        target_train_1_form: {
                            bf: "b",
                            ce: "c",
                            ec: "e",
                            fb: "f"
                        },
                        target_train_2_form: {
                            bf: "f",
                            ce: "e",
                            ec: "c",
                            fb: "b"
                        }
                    },
                    i = o[e];
                0 < t.a && 0 < t[i.bf] && 0 < t.c && 0 < t.d && 0 < t.e ? t[i.bf] > t.d && t[i.ce] > t[i.ec] && t.a >= t[i.ce] - t[i.ec] ? t.a == t[i.ce] - t[i.ec] ? t[i.fb] = t[i.bf] - t.d : (t[i.bf + "-d"] = t[i.bf] - t.d, t["a-(" + i.ce + "-" + i.ec + ")"] = t.a - (t[i.ce] - t[i.ec]), t[i.fb] = Math.sqrt(t[i.bf + "-d"] * t[i.bf + "-d"] + t["a-(" + i.ce + "-" + i.ec + ")"] * t["a-(" + i.ce + "-" + i.ec + ")"])) : t[i.fb] = 0 : t[i.fb] = 0, $("#" + a + i.fb).val(t[i.fb].toFixed(yi.length.prec));
                break;
            case "target_paragramm_2_form":
            case "target_paragramm_3_form":
                0 < t.a && 0 < t.b && 0 < t.c && 0 < t.d && 0 < t.h ? (t.cx = Math.sqrt(t.c * t.c - (t.h - t.b) * (t.h - t.b)), t.ex = t.cx + t.d - t.a, t.e = Math.sqrt(t.ex * t.ex + t.h * t.h)) : t.e = 0, $("#" + a + "e").val(t.e.toFixed(yi.length.prec));
                break;
            case "target_wigwam_form":
                0 < t.a && 0 < t.b && 0 < t.c && 0 < t.h && 0 < t.h2 ? (t["05b"] = t.b / 2, t["a+05b"] = t.a + t["05b"], t["c+05b"] = t.c + t["05b"], t.h1 = t.h - t.h2, t.d = Math.sqrt(t["a+05b"] * t["a+05b"] + t.h * t.h), t.e = Math.sqrt(t["c+05b"] * t["c+05b"] + t.h * t.h), t.f = Math.sqrt(t["05b"] * t["05b"] + t.h1 * t.h1), t.g = t.f) : (t.h1 = 0, t.d = 0, t.e = 0, t.f = 0, t.g = 0), $("#" + a + "d").val(t.d.toFixed(yi.length.prec)), $("#" + a + "e").val(t.e.toFixed(yi.length.prec)), $("#" + a + "f").val(t.f.toFixed(yi.length.prec)), $("#" + a + "g").val(t.g.toFixed(yi.length.prec)), $("#" + a + "h1").val(t.h1.toFixed(yi.length.prec));
                break;
            case "target_tank_form":
            case "target_tank_2_form":
                0 < t.a && 0 < t.c && 0 < t.a1 && 0 < t.a2 && 0 < t.h1 && 0 < t.h2 ? (t.a3 = t.a + t.a2 - t.a1 - t.c, t.b = Math.sqrt(t.h1 * t.h1 + t.a1 * t.a1), t.d = Math.sqrt((t.h1 - t.h2) * (t.h1 - t.h2) + t.a3 * t.a3), t.e = Math.sqrt(t.h2 * t.h2 + t.a2 * t.a2)) : (t.b = 0, t.d = 0, t.e = 0, t.a3 = 0), $("#" + a + "b").val(t.b.toFixed(yi.length.prec)), $("#" + a + "d").val(t.d.toFixed(yi.length.prec)), $("#" + a + "e").val(t.e.toFixed(yi.length.prec)), $("#" + a + "a3").val(t.a3.toFixed(yi.length.prec));
                break;
            case "target_ftable_form":
                0 < t.a && 0 < t.b && 0 < t.c && 0 < t.e && 0 < t.f ? (t.d = t.b, t.h = t.f, t.g = t.c - t.a - t.e) : (t.d = 0, t.h = 0, t.g = 0), $("#" + a + "d").val(t.d.toFixed(yi.length.prec)), $("#" + a + "h").val(t.h.toFixed(yi.length.prec)), $("#" + a + "g").val(t.g.toFixed(yi.length.prec));
                break;
            case "target_hill_5_form":
                0 < t.b && 0 < t.h2 ? (t["b/2"] = t.b / 2, t.f = Math.sqrt(t["b/2"] * t["b/2"] + t.h2 * t.h2), t.g = t.f) : (t.f = 0, t.g = 0), $("#" + a + "f").val(t.f.toFixed(yi.length.prec)), $("#" + a + "g").val(t.g.toFixed(yi.length.prec));
                break;
            case "target_hill_6_form":
                t.L1 = 0 < t.a && 0 < t.b && 0 < t.c && 0 < t.L ? t.a - t.b - t.c - t.L : 0, $("#" + a + "L1").val(t.L1.toFixed(yi.length.prec));
                break;
            case "target_nest_5_form":
                t.j = 0 < t.c && 0 < t.a && 0 < t.e ? t.c - t.a - t.e : 0, $("#" + a + "j").val(t.j.toFixed(yi.length.prec)), 0 < t.b && 0 < t.f && 0 < t.g && 0 < t.j ? (t.d = t.b, t.h = t.g, t.i = t.f, t["j/2"] = t.j / 2, t.L1_top = Math.sqrt(t.g * t.g - t["j/2"] * t["j/2"]), t.L1 = t.f + t.L1_top) : (t.d = 0, t.h = 0, t.i = 0, t["j/2"] = 0, t.L1_top = 0, t.L1 = 0), $("#" + a + "d").val(t.d.toFixed(yi.length.prec)), $("#" + a + "h").val(t.h.toFixed(yi.length.prec)), $("#" + a + "i").val(t.i.toFixed(yi.length.prec)), $("#" + a + "L1").val(t.L1.toFixed(yi.length.prec));
                break;
            default:
        }
        return t
    }

    function na(e, t, _) {
        switch (e) {
            case "target_triangle_form":
                0 < t.a && 0 < t.b && 0 < t.c && !$("#" + _ + "a").prop("disabled") && !$("#" + _ + "b").prop("disabled") && !$("#" + _ + "c").prop("disabled") && 0 == t.h && 0 == t.a1 ? t.a + t.b > t.c && t.a + t.c > t.b && t.b + t.c > t.a || ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 \u0442\u0440\u0435\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u0430 \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u0430 \u0441\u0443\u043C\u043C\u044B \u0434\u0432\u0443\u0445 \u0434\u0440\u0443\u0433\u0438\u0445 \u0441\u0442\u043E\u0440\u043E\u043D") : 0 < t.a1 && 0 < t.b && 0 < t.c && !$("#" + _ + "a1").prop("disabled") && !$("#" + _ + "b").prop("disabled") && !$("#" + _ + "c").prop("disabled") && 0 == t.h && 0 == t.a ? (t.b <= t.a1 && ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 <b>b</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F <b>a1</b>"), t.c < t.h && ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 <b>c</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u0430 \u0434\u043B\u0438\u043D\u0435 \u0441\u043A\u0430\u0442\u0430 <b>h</b>")) : 0 < t.b && 0 < t.c && 0 < t.h && !$("#" + _ + "b").prop("disabled") && !$("#" + _ + "c").prop("disabled") && !$("#" + _ + "h").prop("disabled") && 0 == t.a && 0 == t.a1 ? (t.b < t.h && ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 <b>b</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u0430 \u0434\u043B\u0438\u043D\u0435 \u0441\u043A\u0430\u0442\u0430 <b>h</b>"), t.c < t.h && ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 <b>c</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u0430 \u0434\u043B\u0438\u043D\u0435 \u0441\u043A\u0430\u0442\u0430 <b>h</b>")) : 0 < t.a && 0 != t.a1 && 0 < t.h && !$("#" + _ + "a").prop("disabled") && !$("#" + _ + "a1").prop("disabled") && !$("#" + _ + "h").prop("disabled") && 0 == t.b && 0 == t.c || (0 < t.a && 0 < t.b && 0 < t.h && !$("#" + _ + "a").prop("disabled") && !$("#" + _ + "b").prop("disabled") && !$("#" + _ + "h").prop("disabled") && 0 == t.a1 && 0 == t.c ? t.b < t.h && ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 <b>b</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u0430 \u0434\u043B\u0438\u043D\u0435 \u0441\u043A\u0430\u0442\u0430 <b>h</b>") : 0 < t.a && 0 < t.c && 0 < t.h && !$("#" + _ + "a").prop("disabled") && !$("#" + _ + "c").prop("disabled") && !$("#" + _ + "h").prop("disabled") && 0 == t.a1 && 0 == t.b && t.c < t.h && ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 <b>c</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u0430 \u0434\u043B\u0438\u043D\u0435 \u0441\u043A\u0430\u0442\u0430 <b>h</b>"));
                break;
            case "target_trapec_form":
                0 < t.a1 && 0 < t.a && 0 < t.c && t.a1 + t.c >= t.a && ai.errors.push("<b>a1 + c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043C\u0435\u043D\u044C\u0448\u0435 <b>a</b>");
                break;
            case "target_paragramm_form":
                0 < t.h && 0 < t.b && t.h > t.b && ai.errors.push("\u0414\u043B\u0438\u043D\u0430 \u0441\u043A\u0430\u0442\u0430 <b>h</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u043C\u0435\u043D\u044C\u0448\u0435 \u0441\u0442\u043E\u0440\u043E\u043D\u044B <b>b</b>");
                break;
            case "target_trapec_2_form":
                0 < t.c && 0 < t.a && t.c <= t.a && ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 <b>c</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a</b>");
                break;
            case "target_trapec_6_form":
                0 < t.c && 0 < t.a && t.a <= t.c && ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 <b>a</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>c</b>");
                break;
            case "target_trapec_7_form":
                0 < t.c && 0 < t.a && t.a <= t.c && ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 <b>a</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>c</b>");
                break;
            case "target_trapec_8_form":
                0 < t.c && 0 < t.a && t.c <= t.a && ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 <b>c</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a</b>");
                break;
            case "target_gun_3_form":
                0 < t.a && 0 < t.c && 0 < t.e && t.a + t.c <= t.e && ai.errors.push("<b>a + c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>e</b>");
                break;
            case "target_air_ex_form":
                0 < t.a && 0 < t.c && t.a <= t.c && ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 <b>a</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>c</b>"), 0 < t.b && 0 < t.d && t.d <= t.b && ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 <b>d</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b</b>");
                break;
            case "target_porch_form":
                0 < t.a && 0 < t.c && 0 < t.e && (t.g = t.c - (t.a + t.e), 0 >= t.g && ai.errors.push("<b>a + e</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043C\u0435\u043D\u044C\u0448\u0435 <b>c</b>"));
                break;
            case "target_home_form":
                0 < t.b && 0 < t.h && t.b >= t.h && ai.errors.push("<b>h</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b</b>");
                break;
            case "target_home_2_form":
                0 < t.a && 0 < t.d && t.a <= t.d && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>d</b>"), 0 < t.h && 0 < t.b && t.h <= t.b && ai.errors.push("<b>h</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b</b>"), 0 < t.h && 0 < t.a && 0 < t.b && 0 < t.c && 0 < t.d && 0 == ai.errors.length && ($("#" + _ + "h").prop("disabled", !0), $("#" + _ + "a").prop("disabled", !0), $("#" + _ + "b").prop("disabled", !0), $("#" + _ + "c").prop("disabled", !0), $("#" + _ + "d").prop("disabled", !0));
                break;
            case "target_hill_form":
                0 < t.a && 0 < t.c && t.a <= t.c && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>c</b>"), 0 < t.e && 0 < t.c && t.e <= t.c && ai.errors.push("<b>e</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>c</b>"), 0 < t.a && 0 < t.e && t.a <= t.e && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>e</b>"), 0 < t.d && 0 < t.b && t.d <= t.b && ai.errors.push("<b>d</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b</b>");
                break;
            case "target_nest_form":
                if (0 < t.c && 0 < t.a && 0 < t.e && t.c <= t.a + t.e && ai.errors.push("<b>c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a + e</b>"), 0 < t.b && 0 < t.h && t.b <= t.h && !$("#" + _ + "h").prop("disabled") && ai.errors.push("<b>b</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>h</b>"), 0 < t.a && 0 < t.c && 0 < t.e && 0 < t.f && 0 < t.g && t.f + t.g < t.c - t.a - t.e && ai.errors.push("<b>f + g</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u043E <b>c - a - e</b>"), 0 < t.a && 0 < t.c && 0 < t.e && 0 < t.g && 0 < t.f)
                    if (t.ae = t.c - t.a - t.e, t.ae + t.g > t.f && t.ae + t.f > t.g && t.g + t.f > t.ae) {
                        var a = (t.ae + t.g + t.f) / 2;
                        t["b-h"] = 2 * Math.sqrt(a * (a - t.ae) * (a - t.g) * (a - t.f)) / t.ae, 0 < t.b && (t.h = t.b - t["b-h"], 0 > t.h && ai.errors.push("<b>h</b> \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442\u0441\u044F \u043C\u0435\u043D\u044C\u0448\u0435 \u043D\u0443\u043B\u044F. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0441\u0442\u043E\u0440\u043E\u043D\u044B <b>g</b>, <b>f</b> \u0438 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 <b>c-a-e</b>"))
                    } else ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 \u0442\u0440\u0435\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u0430 \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0441\u0443\u043C\u043C\u044B \u0434\u0432\u0443\u0445 \u0434\u0440\u0443\u0433\u0438\u0445. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0441\u0442\u043E\u0440\u043E\u043D\u044B <b>g</b>, <b>f</b> \u0438 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 <b>c-a-e</b>");
                break;
            case "target_nest_2_form":
                if (0 < t.a && 0 < t.l && 0 < t.e && 0 < t.a1 && 0 < t.c) {
                    var r = t.a + t.l + t.e - t.a1 - t.c;
                    0 > r && ai.errors.push("<b>a + l + e</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u043E <b>a1 + c</b>")
                }
                if (0 < t.f && 0 < t.g && 0 < t.l) {
                    t.f + t.g > t.l && t.f + t.l > t.g && t.g + t.l > t.f || ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 \u0442\u0440\u0435\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u0430 \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0441\u0443\u043C\u043C\u044B \u0434\u0432\u0443\u0445 \u0434\u0440\u0443\u0433\u0438\u0445. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0441\u0442\u043E\u0440\u043E\u043D\u044B <b>f, g, l</b>");
                    var a = (t.l + t.g + t.f) / 2;
                    t.lgf_h = 2 * Math.sqrt(a * (a - t.l) * (a - t.g) * (a - t.f)) / t.l, t.lgf_h >= t.h && ai.errors.push("\u0412\u044B\u0441\u043E\u0442\u0430 \u0442\u0440\u0435\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u0430 <b>f, g, l</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u043C\u0435\u043D\u044C\u0448\u0435 \u0434\u043B\u0438\u043D\u044B \u0441\u043A\u0430\u0442\u0430 <b>h</b>")
                }
                break;
            case "target_corner_form":
                0 < t.c && 0 < t.a && t.c <= t.a && ai.errors.push("<b>c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a</b>"), 0 < t.d && 0 < t.b && t.d <= t.b && ai.errors.push("<b>d</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b</b>");
                break;
            case "target_trapec_3_form":
                0 < t.a1 && 0 < t.a && 0 < t.c && t.a1 + t.a >= t.c && ai.errors.push("<b>c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a1 + a</b>");
                break;
            case "target_hill_2_form":
                0 < t.f && 0 < t.b && 0 < t.d && t.f <= t.b + t.d && ai.errors.push("<b>f</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b + d</b>"), 0 < t.a && 0 < t.b && 0 < t.d && t.a <= t.b + t.d && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b + d</b>"), 0 < t.a && 0 < t.f && t.a <= t.f && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>f</b>"), 0 < t.c && 0 < t.e && t.c <= t.e && ai.errors.push("<b>c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>e</b>");
                break;
            case "target_corner_2_form":
                0 < t.c && 0 < t.a && t.a <= t.c && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>c</b>"), 0 < t.d && 0 < t.b && t.d <= t.b && ai.errors.push("<b>d</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b</b>");
                break;
            case "target_gun_form":
                0 < t.c && 0 < t.a && 0 < t.e && t.c <= t.a + t.e && ai.errors.push("<b>c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a + e</b>"), 0 < t.b && 0 < t.d && t.b <= t.d && ai.errors.push("<b>b</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>d</b>");
                break;
            case "target_gun_2_form":
                0 < t.d && 0 < t.a && 0 < t.b && t.d <= t.a + t.b && ai.errors.push("<b>d</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a + b</b>"), 0 < t.e && 0 < t.c && t.e <= t.c && ai.errors.push("<b>e</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>c</b>");
                break;
            case "target_goose_form":
                0 < t.e && 0 < t.b && t.e <= t.b && ai.errors.push("<b>e</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b</b>"), 0 < t.d && 0 < t.a && t.d <= t.a && ai.errors.push("<b>d</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a</b>");
                break;
            case "target_home_4_form":
                0 < t.a && 0 < t.a1 && t.a / 2 <= t.a1 && ai.errors.push("<b>a/2</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a1</b>"), 0 < t.h && 0 < t.h1 && t.h <= t.h1 && ai.errors.push("<b>h</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>h1</b>"), 0 < t.b && 0 < t.h1 && t.b <= t.h1 && ai.errors.push("<b>b</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>h1</b>"), 0 < t.b && 0 < t.c && 0 < t.h && t.b + t.c <= t.h && ai.errors.push("<b>b+c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>h</b>");
                break;
            case "target_nest_3_form":
                0 < t.b && 0 < t.h && t.b >= t.h && ai.errors.push("<b>h</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b</b>"), 0 < t.a && 0 < t.c && 0 < t.e && t.a + t.e / 2 <= t.c / 2 && ai.errors.push("<b>a + e/2</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>c/2</b>"), 0 < t.d && 0 < t.e && t.d <= t.e / 2 && ai.errors.push("<b>d</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>e/2</b>");
                break;
            case "target_hill_3_form":
            case "target_hill_4_form":
                0 < t.a && 0 < t.b && 0 < t.c && !$("#" + _ + "a").prop("disabled") && !$("#" + _ + "b").prop("disabled") && !$("#" + _ + "c").prop("disabled") ? t.a <= t.b + t.c && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b + c</b>") : 0 < t.a && 0 < t.b && 0 < t.L && !$("#" + _ + "a").prop("disabled") && !$("#" + _ + "b").prop("disabled") && !$("#" + _ + "L").prop("disabled") ? t.a <= t.b + t.L + t.L && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b + 2*L</b>") : 0 < t.a && 0 < t.c && 0 < t.L && !$("#" + _ + "a").prop("disabled") && !$("#" + _ + "c").prop("disabled") && !$("#" + _ + "L").prop("disabled") && t.a <= t.c + t.L + t.L && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>c + 2*L</b>"), 0 < t.h1 && 0 < t.h2 && t.h1 <= t.h2 && ai.errors.push("<b>h1</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>h2</b>");
                break;
            case "target_nest_4_form":
                0 < t.a && 0 < t.a1 && t.a1 >= t.a && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a1</b>"), 0 < t.L && 0 < t.L1 && t.L1 >= t.L && ai.errors.push("<b>L</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>L1</b>"), 0 < t.L && 0 < t.f && t.f >= t.L && ai.errors.push("<b>L</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>f</b>"), 0 < t.a1 && 0 < t.c && 0 < t.a && 0 < t.j && t.a + t.j >= t.a1 + t.c && ai.errors.push("<b>a1 + c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a + j</b>"), 0 < t.a1 && 0 < t.c && 0 < t.a && 0 < t.j && 0 < t.e && t.a + t.j + t.e <= t.a1 + t.c && ai.errors.push("<b>a1 + c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043C\u0435\u043D\u044C\u0448\u0435 <b>a + j + e</b>");
                break;
            case "target_home_3_form":
                0 < t.a && 0 < t.L && t.a >= t.L && ai.errors.push("<b>L</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a</b>"), 0 < t.b && 0 < t.H && t.b >= t.H && ai.errors.push("<b>H</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b</b>");
                break;
            case "target_horn_form":
                0 < t.a && 0 < t.b && t.b >= t.a && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b</b>"), 0 < t.h && 0 < t.h1 && t.h1 >= t.h && ai.errors.push("<b>h</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>h1</b>");
                break;
            case "target_vase_form":
                0 < t.a && 0 < t.b && t.a >= t.b && ai.errors.push("<b>b</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a</b>"), 0 < t.a && 0 < t.c && t.a >= t.c && ai.errors.push("<b>c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a</b>"), 0 < t.b && 0 < t.c && t.b >= t.c && ai.errors.push("<b>c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b</b>"), 0 < t.a && 0 < t.c && 0 < t.d && (t["(c-a)/2"] = (t.c - t.a) / 2, t["(c-a)/2"] >= t.d && ai.errors.push("<b>d</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>(c-a)/2</b>")), 0 < t.h && 0 < t.h1 && t.h1 >= t.h && ai.errors.push("<b>h</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>h1</b>");
                break;
            case "target_trapec_4_form":
                0 < t.h && 0 < t.d && t.d >= t.h && ai.errors.push("<b>h</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>d</b>"), 0 < t.a && 0 < t.a1 && t.a1 >= t.a && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a1</b>"), 0 < t.e && 0 < t.e1 && t.e1 >= t.e && ai.errors.push("<b>e</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>e1</b> (e1 = a - 2*a1)"), 0 > t.c && ai.errors.push("<b>c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u043E <b>0</b>");
                break;
            case "target_trapec_5_form":
                0 < t.h && 0 < t.d && t.d >= t.h && ai.errors.push("<b>h</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>d</b>"), 0 < t.a && 0 < t.a1 && t.a1 >= t.a && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a1</b>"), 0 < t.c && 0 < t.c1 && t.c1 >= t.c && ai.errors.push("<b>c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>c1</b> (c1 = a - 2*a1)"), 0 > t.e && ai.errors.push("<b>e</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u043E <b>0</b>");
                break;
            case "target_train_1_form":
                0 < t.b && 0 < t.d && t.d >= t.b && ai.errors.push("<b>b</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>d</b>"), 0 < t.c && 0 < t.e && t.e >= t.c && ai.errors.push("<b>c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>e</b>"), 0 < t.a && 0 < t.c && 0 < t.e && t.c - t.e > t.a && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u043E <b>\u0441-e</b>");
                break;
            case "target_train_2_form":
                0 < t.f && 0 < t.d && t.d >= t.f && ai.errors.push("<b>f</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>d</b>"), 0 < t.e && 0 < t.c && t.c >= t.e && ai.errors.push("<b>e</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>c</b>"), 0 < t.a && 0 < t.c && 0 < t.e && t.e - t.c > t.a && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u043E <b>e-c</b>");
                break;
            case "target_paragramm_2_form":
            case "target_paragramm_3_form":
                0 < t.h && 0 < t.b && t.b >= t.h && ai.errors.push("<b>h</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>b</b>"), 0 < t.b && 0 < t.c && 0 < t.h && t.h >= t.b + t.c && ai.errors.push("<b>b + c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>h</b>");
                break;
            case "target_wigwam_form":
                0 < t.h && 0 < t.h2 && t.h2 >= t.h && ai.errors.push("<b>h</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>h2</b>");
                break;
            case "target_tank_form":
            case "target_tank_2_form":
                0 < t.a && 0 < t.a2 && 0 < t.a1 && 0 < t.c && t.a1 + t.c >= t.a + t.a2 && ai.errors.push("<b>a + a2</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a1 + c</b>"), 0 < t.h1 && 0 < t.h2 && t.h2 >= t.h1 && ai.errors.push("<b>h1</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>h2</b>");
                break;
            case "target_ftable_form":
                0 < t.b && 0 < t.f && t.b <= t.f && ai.errors.push("<b>b</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>f</b>"), 0 < t.c && 0 < t.a && 0 < t.e && t.c <= t.a + t.e && ai.errors.push("<b>c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a + e</b>");
                break;
            case "target_hill_5_form":
                0 < t.a && 0 < t.b && 0 < t.c && 0 < t.L1 && 0 < t.d && 0 < t.L2 && 0 < t.e && t.a + t.b + t.c <= t.L1 + t.d + t.L2 + t.e && ai.errors.push("<b>a + b + c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>L1 + d + L2 + e</b>"), 0 < t.h2 && 0 < t.h3 && 0 < t.h1 && t.h2 + t.h3 <= t.h1 && ai.errors.push("<b>h2 + h3</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>h1</b>");
                break;
            case "target_hill_6_form":
                0 < t.a && 0 < t.c && 0 < t.b && 0 < t.L && t.a <= t.c + t.b + t.L && ai.errors.push("<b>a</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>c + b + L</b>"), 0 < t.h1 && 0 < t.h2 && t.h1 <= t.h2 && ai.errors.push("<b>h1</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>h2</b>");
                break;
            case "target_nest_5_form":
                0 < t.c && 0 < t.a && 0 < t.e && t.c <= t.a + t.e && ai.errors.push("<b>c</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>a + e</b>"), 0 < t.b && 0 < t.L1 && t.b <= t.L1 && ai.errors.push("<b>b</b> \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 <b>L1</b>");
                break;
            default:
        }
    }

    function sa() {
        var e = $("#figures_all_forms").find(".one_figure_form.active form"),
            t = e[0].id,
            _ = t.replace("form", ""),
            a = Vt(t, _);
        switch (a.direction = $("#" + _ + "direction").val(), ai = JSON.parse(JSON.stringify(ri)), t) {
            case "target_rect_form":
            case "target_triangle_2_form":
            case "target_triangle_3_form":
            case "target_triangle_4_form":
            case "target_triangle_5_form":
                break;
            case "target_triangle_form":
            case "target_trapec_form":
            case "target_paragramm_form":
            case "target_trapec_2_form":
            case "target_trapec_6_form":
            case "target_trapec_7_form":
            case "target_trapec_8_form":
            case "target_gun_3_form":
            case "target_air_ex_form":
            case "target_porch_form":
            case "target_home_form":
            case "target_home_2_form":
            case "target_hill_form":
            case "target_nest_form":
            case "target_nest_2_form":
            case "target_corner_form":
            case "target_trapec_3_form":
            case "target_hill_2_form":
            case "target_corner_2_form":
            case "target_gun_form":
            case "target_gun_2_form":
            case "target_goose_form":
            case "target_home_4_form":
            case "target_nest_3_form":
            case "target_hill_3_form":
            case "target_hill_4_form":
            case "target_nest_4_form":
            case "target_home_3_form":
            case "target_horn_form":
            case "target_vase_form":
            case "target_trapec_4_form":
            case "target_trapec_5_form":
            case "target_train_1_form":
            case "target_train_2_form":
            case "target_paragramm_2_form":
            case "target_paragramm_3_form":
            case "target_wigwam_form":
            case "target_tank_form":
            case "target_tank_2_form":
            case "target_ftable_form":
            case "target_hill_5_form":
            case "target_hill_6_form":
            case "target_nest_5_form":
                na(t, a, _);
                break;
            default:
        }
        if (0 < ai.errors.length) return void Qt(t, ai);
        if (Kt(t, a, _), 0 < ai.errors.length) return void Qt(t, ai);
        var r = Ht(t, a);
        return null === r && ai.errors.push("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u0444\u0438\u0433\u0443\u0440\u0443 (#2)"), 0 < ai.errors.length ? void Qt(t, ai) : void(di = {
            type: "h_pline_add_paste_figure",
            need_layer_num: yo,
            need_tab_scale: Go.g_scale[vo],
            need_axis: {
                g_x: Fo[vo],
                g_y: Ao[vo],
                current_layer_name: vo
            },
            pline_data: {
                id: r.attrs.id,
                name: r.attrs.name,
                points: JSON.copy(r.attrs.points),
                offset_origin: JSON.copy(r.attrs.offset_origin),
                is_offset_origin_add: !1
            }
        }, An({
            mode: "add",
            element: di
        }), oa(r), 1 == b_() && v_(), to[vo].draw(), $("#modal_html").modal("hide"))
    }

    function oa(e) {
        to[vo].add(e), I({
            "data-element": "pline",
            id: e.id()
        }), processAndClearElement(e), vt(e, !1), processElementAndAddMovePoints(e, !1), hs(e), updateElementParametersDisplay(e), se(), ie(), oe(), ce(), da()
    }

    function ia(e) {
        var t = [],
            _ = [];
        $.each(e, function(e, t) {
            $.each(t, function(e, t) {
                _.push(t.length)
            })
        }), _ = _.sort(function(e, t) {
            return e - t
        });
        var a = -1,
            r = {
                size: 0,
                amount: 0,
                quantity: 0,
                quantity_useful: 0,
                code_1c: ""
            };
        return $.each(_, function(e, _) {
            _ != a && (0 < r.amount && t.push(r), a = _, r = {
                size: parseFloat((_ / Mo.unit_coefficient).toFixed(2)),
                amount: 0,
                quantity: 0,
                quantity_useful: 0,
                code_1c: Mo.nom_code_1c
            }), r.amount += 1
        }), 0 < r.amount && t.push(r), $.each(t, function(e, _) {
            t[e].quantity = 10 * Math.round(100 * _.size) * _.amount * parseInt(1e3 * Mo.sheet_width) / 1000000000, t[e].quantity_useful = 10 * Math.round(100 * _.size) * _.amount * parseInt(1e3 * Mo.sheet_width_useful) / 1000000000
        }), t
    }

    function la() {
        Ro != ti.id && K("roof_files_list_update", {})
    }

    function ca() {
        switch (Qs = !1, $(".js_roof_param").hide(), $(".js_roof_param_type_" + Mo.type).show(), Mo.type) {
            case "mch":
                if (0 == $("#roof_param_sheet_max_length_select option[value=\"" + Mo.sheet_max_length[vo] + "\"]").length) {
                    var e = Mo.sheet_max_length[vo],
                        t = $("#roof_param_sheet_max_length_select option:last").val();
                    Mo.sheet_max_length[vo] = t
                }
                $("#roof_param_sheet_max_length_select").val(Mo.sheet_max_length[vo]);
                break;
            case "mch_modul":
                $("#roof_param_sheet_max_length_modul_input").val((Mo.sheet_max_length[vo] / 1e3).toFixed(2));
                break;
            case "pn":
            case "falc":
                $("#roof_param_sheet_max_length_" + Mo.type + "_input").val((Mo.sheet_max_length[vo] / 1e3).toFixed(2));
                break;
            case "siding":
            case "siding_vert":
                break;
            default:
        }
        switch ($("#roof_param_offset_x_input").val((Mo.offset_x[vo] / 1e3).toFixed(2)), $("#roof_param_offset_y_input").val((Mo.offset_y[vo] / 1e3).toFixed(2)), Mo.direction[vo]) {
            case "lr":
                $("#roof_param_direction_icon").removeClass("nav_roof_icon_direction_rl").addClass("nav_roof_icon_direction_lr");
                break;
            case "rl":
                $("#roof_param_direction_icon").removeClass("nav_roof_icon_direction_lr").addClass("nav_roof_icon_direction_rl");
                break;
            default:
        }
        switch (Mo.direction_y[vo]) {
            case "du":
                $("#roof_param_direction_y_icon").removeClass("nav_roof_icon_direction_ud").addClass("nav_roof_icon_direction_du");
                break;
            case "ud":
                $("#roof_param_direction_y_icon").removeClass("nav_roof_icon_direction_du").addClass("nav_roof_icon_direction_ud");
                break;
            default:
        }
        switch (Mo.sheet_length_text_mode[vo]) {
            case "center_hor":
                $("#roof_param_sheet_length_text_mode_icon").removeClass("nav_roof_icon_sheet_length_text_mode_center_vert").addClass("nav_roof_icon_sheet_length_text_mode_center_hor"), $("#nav_li_view_sheet_length_text_mode_center_hor").find("i.fa-check").show(), $("#nav_li_view_sheet_length_text_mode_center_vert").find("i.fa-check").hide(), $("#nav_li_view_sheet_length_text_mode_center_hor_context").find("i.fa-check").show(), $("#nav_li_view_sheet_length_text_mode_center_vert_context").find("i.fa-check").hide();
                break;
            case "center_vert":
                $("#roof_param_sheet_length_text_mode_icon").removeClass("nav_roof_icon_sheet_length_text_mode_center_hor").addClass("nav_roof_icon_sheet_length_text_mode_center_vert"), $("#nav_li_view_sheet_length_text_mode_center_hor").find("i.fa-check").hide(), $("#nav_li_view_sheet_length_text_mode_center_vert").find("i.fa-check").show(), $("#nav_li_view_sheet_length_text_mode_center_hor_context").find("i.fa-check").hide(), $("#nav_li_view_sheet_length_text_mode_center_vert_context").find("i.fa-check").show();
                break;
            default:
        }
        switch (Mo.offset_run_type[vo]) {
            case "long_short":
                $("#roof_param_offset_run_type_icon").removeClass("nav_roof_icon_offset_run_type_short_long").addClass("nav_roof_icon_offset_run_type_long_short");
                break;
            case "short_long":
                $("#roof_param_offset_run_type_icon").removeClass("nav_roof_icon_offset_run_type_long_short").addClass("nav_roof_icon_offset_run_type_short_long");
                break;
            default:
        }
        $("#roof_param_cornice_input").val((Mo.cornice[vo] / 1e3).toFixed(2)), "siding_vert" == Mo.type && $("#roof_param_offset_run_type_icon").parent().show(), Qs = !0
    }

    function da() {
        var e = Ct({
            filter_type: ["pline"],
            filter_visible: "1"
        });
        0 == e.length ? pa() : 1 <= e.length && (pa(), yl.html(ut(e[0].slope_length.toFixed(3))), ml.html(ut(e[0].scale_without_cuts.toFixed(3))), hl.html(ut(e[0].scale.toFixed(3))), "undefined" != typeof e[0].columns_sheets && (ul.html(ut(e[0].scale_sheets_full.toFixed(3))), fl.html(ut(e[0].scale_sheets_useful.toFixed(3))), gl.html(ut(e[0].scale_sheets_waste.toFixed(3)))))
    }

    function pa() {
        yl.html("-"), ml.html("-"), hl.html("-"), ul.html("-"), fl.html("-"), gl.html("-")
    }

    function ma() {
        return !1
    }

    function ha(e) {
        var t = Bi.findOne("#" + e);
        t.stroke("#ff8223"), to[vo].draw()
    }

    function ua() {
        var e = "";
        "undefined" != typeof Zi && "undefined" !== Zi && "Line" == Zi.className && (e = Zi.id()), $.each(to[vo].children, function(t, _) {
            var a = _.id();
            if ("undefined" != typeof a && -1 < a.indexOf("__")) {
                var r = a.substr(0, a.indexOf("__"));
                switch (r) {
                    case "pline":
                        a != e && _.stroke(mainColors.default_element_color);
                        break;
                    default:
                }
            }
        }), to[vo].draw()
    }

    function fa(e) {
        if (ua(), "undefined" != typeof e.type && "undefined" != typeof e.evt) {
            $(".d_context_menu_one").hide(), zi = "";
            var t = Ct({
                filter_type: ["pline"],
                filter_visible: "1",
                filter_is_object_visible: "1",
                filter_is_closed: "1",
                filter_with_point_in_polygon: {
                    x: e.evt.layerX,
                    y: e.evt.layerY
                },
                what: ["pline_points", "pline_points_x_y", "pline_id", "is_object_visible", "pline_is_closed", "pline_scale", "pline_roof_calc", "offset_origin"],
                order_by: "scale",
                order_as: "ASC",
                limit_: 1
            });
            return 1 == t.length ? ("undefined" != typeof Zi && "undefined" !== Zi && "Line" == Zi.className && (se(), oe(), ce(), Zi.stroke(mainColors.default_element_color), Zi = "undefined"), $("#context_menu_pline").show(), zi = t[0].id, ha(zi)) : $("#context_menu_" + e.type).show(), Ra(), Ha(), Ja(), kl.css({
                top: e.evt.pageY + "px",
                left: e.evt.pageX + "px"
            }), kl.show(), $o = !0, !1
        }
    }

    function ga(e, t, _) {
        switch (no[vo].hide(), so[vo].hide(), mi = !1, Oo.mode) {
            case "default":
                ka(e, t, _);
                break;
            case "add_element":
                "undefined" == typeof Zi || "undefined" == Zi ? ka(e, t, _) : ba(e.attrs.id, t, _);
                break;
            default:
        }
    }

    function ya(e) {
        switch (Oo.mode) {
            case "default":
                setTimeout(function() {
                    fa({
                        type: "canvas",
                        evt: e.evt
                    })
                }, 100);
                break;
            case "add_element":
                "undefined" != typeof Zi && "undefined" != Zi && "pline" == Oo["data-element"] && ba(Zi.id(), e);
                break;
            default:
        }
    }

    function ba(e, t, _) {
        var a = Zi.points();
        4 < a.length ? (a = a.slice(0, a.length - 2), Zi.setPoints(a), yt(Zi.id(), !0), processElementAndAddMovePoints(Zi, !0), updatePolylineLastPoint(t, _), to[vo].draw(), 8 > a.length && c_("btn_finish_cad_draw_close"), $n(a[a.length - 4], a[a.length - 3])) : (Ji = "undefined", handleKeyPress(27))
    }

    function va(e, t, _, a, r, n) {
        var s = r - _,
            o = n - a,
            i = s * s + o * o,
            l = -1;
        0 != i && (l = ((e - _) * s + (t - a) * o) / i);
        var c, d;
        0 > l ? (c = _, d = a) : 1 < l ? (c = r, d = n) : (c = _ + l * s, d = a + l * o);
        var p = e - c,
            m = t - d;
        return Math.sqrt(p * p + m * m)
    }

    function xa(e, t, _) {
        for (var a = _.length, r = -1, n = -1, s = -1, o = 0; o < a / 2; o++) r = va(e, t, _[2 * o + 0], _[2 * o + 1], _[2 * o + 2], _[2 * o + 3]), 0 == o ? (n = r, s = o) : r < n && (n = r, s = o);
        return s
    }

    function wa(e, t) {
        for (var _ = [], a = 2 * t + 2; a < e.length; a++) _.push(e[a]);
        for (var a = 2; a < 2 * t + 2; a++) _.push(e[a]);
        return _.push(e[0]), _.push(e[1]), _
    }

    function ka(e, t, _) {
        var a = e.attrs.points;
        ji = "break", Ci = JSON.copy(e.attrs.points), Li = Go.g_scale[vo];
        var r = xa(t, _, a),
            n = wa(a, r);
        e.setPoints(n), ja(e.id()), Ra(), Ha(), Ja(), l_("btn_finish_cad_draw"), 8 <= n.length ? "roof" == ei.type && l_("btn_finish_cad_draw_close") : processElementAndAddMovePoints(e, !0), 4 < n.length && $n(n[n.length - 4], n[n.length - 3]), updatePolylineLastPoint(t, _), to[vo].draw()
    }

    function za(e) {
        $("#collapseOne").find(".d_elements_button").removeClass("active"), $("#collapseOne").find("[data-element=\"" + e + "\"]").addClass("active")
    }

    function ja(e) {
        var t = e.substr(0, e.indexOf("__"));
        switch (T(e, {}), za(t), t) {
            case "pline":
                st(Zi), Ji = "temp";
                break;
            default:
        }
        ue({
            mode: "add_element",
            "data-element": t
        })
    }

    function Ca() {
        $.each(["sheet_max_length", "offset_x", "offset_y", "direction", "direction_y", "sheet_length_text_mode", "tabs_re_roof", "cornice", "offset_run_type"], function(e, t) {
            Mo[t][vo] = Mo[t]["default"]
        })
    }

    function La() {
        switch ($("#r_d_nav_1").find(".js_nav_li_dis").removeClass("disabled"), Mo.product_type) {
            case "roof":
                $("#roofstat_table_roofstat_s_slope").html("\u0441\u043A\u0430\u0442\u0430");
                break;
            case "fasad":
                $("#roofstat_table_roofstat_s_slope").html("\u0444\u0430\u0441\u0430\u0434\u0430");
                break;
            default:
        }
    }

    function Oa() {
        if ("undefined" != typeof Mo.nom_code_1c) switch (Wo.settings_programm_sheet_tabs.name_mode) {
            case 0:
                $("#nav_li_edit_tab_rename").removeClass("disabled");
                break;
            case 1:
                $("#nav_li_edit_tab_rename").addClass("disabled");
                if ("undefined" != typeof Mo && "undefined" != typeof Mo.product_type) switch (Mo.product_type) {
                    case "roof":
                        break;
                    case "fasad":
                        break;
                    default:
                }
                var e = rl.find(".d_bottom_tab");
                $.each(e, function(e, t) {
                    $(t).html(e + 1)
                });
                break;
            default:
        }
    }

    function Fa() {
        var e = 0;
        $.each(Mo.tabs_re_roof, function(t, _) {
            "default" != t && (e = parseInt(t.replace("layer_", "")), 1 == _ ? 0 == rl.find("[data-layer-num=\"" + e + "\"]").find(".d_bottom_tab_icon_re_roof").length && rl.find("[data-layer-num=\"" + e + "\"]").append("<i class=\"fa fa-refresh d_bottom_tab_icon_re_roof\" aria-hidden=\"true\"></i>") : 0 == _ && 0 < rl.find("[data-layer-num=\"" + e + "\"]").find(".d_bottom_tab_icon_re_roof").length && rl.find("[data-layer-num=\"" + e + "\"]").find(".d_bottom_tab_icon_re_roof").remove())
        })
    }

    function Aa(e) {
        var t = $("#" + e.id),
            _ = t.find(".current"),
            a = parseInt(_.attr("data-page"));
        if ("set" != e.mode || a != parseInt(e.page)) {
            var r = t.find(".first"),
                n = parseInt(r.attr("data-page")),
                s = t.find(".last"),
                o = parseInt(s.attr("data-page")),
                i = 0;
            switch (e.mode) {
                case "set":
                    i = parseInt(e.page);
                    break;
                case "next":
                    i = a + 1;
                    break;
                case "prev":
                    i = a - 1;
                    break;
                default:
            }
            if (!(i < n || i > o || i == a)) {
                var l = t.find("[data-page=\"" + i + "\"]");
                _.removeClass("current"), l.addClass("current");
                var c = {
                    type: "pagination",
                    mode: "set",
                    page: i
                };
                switch (e.id) {
                    case "pagination_roof_open_modal_files":
                        switch ($("#roof_modal_files_list_table_tbody").find(".js_tr_data").remove(), $("#roof_modal_files_list_table_tbody_tr_loading").show(), e.submode) {
                            case "files_table_search_pagination":
                                $("#pagination_roof_open_modal_files").html(""), c = $("#files_table_search").serializeArray(), c = Nt(c), c.page = i, K("files_table_search", c);
                                break;
                            default:
                                K(e.id, c);
                        }
                        break;
                    case "pagination_releasenotes_list":
                        $("#releasenotes_list").find(".one_release").remove(), $("#releasenotes_list").find(".loading_1").remove(), $("#releasenotes_list").append("<div class=\"rowcell loading_1\"></div>"), K(e.id, c);
                        break;
                    default:
                }
            }
        }
    }

    function qa(e) {
        var t = !0;
        "undefined" != typeof e.CheckIsVisible && !1 == e.CheckIsVisible && (t = !1), Zs[vo].destroyChildren(), $.each(to[vo].children, function(e, _) {
            (!1 == t || t && _.isVisible()) && "undefined" != typeof _.attrs.id && processElementAndAddMovePoints(_, !1)
        })
    }

    /**
     * Обрабатывает элемент в зависимости от его типа и добавляет точки перемещения.
     *
     * @param {Object} element - Объект элемента (например, Konva.Line), который нужно обработать.
     * @param {boolean} isTemporary - Указывает, нужно ли обрабатывать элемент как временный (например, обрезать последние точки).
     */
    function processElementAndAddMovePoints(element, isTemporary) {
        switch (element.className) {
            case "Line":
                var elementId = element.id(); // Получаем ID элемента
                var elementType = elementId.substr(0, elementId.indexOf("__")); // Определяем тип элемента
                var points = element.points(); // Получаем точки элемента

                // Если элемент временный, обрезаем последние две точки
                if (isTemporary) {
                    points = points.slice(0, points.length - 2);
                }

                // Обрабатываем элемент в зависимости от его типа
                switch (elementType) {
                    case "pline":
                        // Удаляем дочерние элементы, связанные с этим элементом
                        removeChildElementsByParentId(elementId);

                        // Создаём точки перемещения для элемента
                        createMovePoints(elementId, points);

                        // Перемещаем слои на передний план
                        Es[vo].moveToTop();
                        Zs[vo].moveToTop();

                        // Перерисовываем слой
                        to[vo].batchDraw();
                        break;

                    default:
                        // Для других типов элементов обработка не предусмотрена
                }
                break;

            default:
                // Для других типов объектов обработка не предусмотрена
        }
    }

    /**
     * Удаляет все дочерние элементы с указанным `parentId` из слоя Zs[vo].
     *
     * @param {string} parentId - ID родительского элемента, дочерние элементы которого нужно удалить.
     */
    function removeChildElementsByParentId(parentId) {
        // Получаем количество дочерних элементов в слое Zs[vo]
        var totalChildren = Zs[vo].children.length;

        // Проходимся по всем дочерним элементам в обратном порядке
        for (var i = totalChildren - 1; i >= 0; i--) {
            var child = Zs[vo].children[i];

            // Если `parent_id` дочернего элемента совпадает с указанным `parentId`, удаляем элемент
            if (child.attrs.parent_id == parentId) {
                child.destroy();
            }
        }
    }

    /**
     * Создаёт и добавляет точки перемещения для указанного элемента.
     *
     * @param {string} parentId - ID родительского элемента.
     * @param {Array} points - Массив координат точек элемента в формате [x1, y1, x2, y2, ...].
     */
    function createMovePoints(parentId, points) {
        var totalPoints = points.length; // Общее количество координат
        var isClosedPolyline = isPolylineClosed(points) ? 1 : 0; // Проверяем, является ли полилиния замкнутой

        // Перебираем все точки и создаём для каждой точку перемещения
        for (var i = 0; i < totalPoints / 2 - isClosedPolyline; i++) {
            var pointData = {
                x: points[2 * i],       // Координата X точки
                y: points[2 * i + 1],   // Координата Y точки
                parent_id: parentId,    // ID родительского элемента
                point_num: i            // Номер точки
            };

            // Создаём точку перемещения
            createMovePoint(pointData);
        }
        
        processLayerElements({})
    }

    /**
     * Создаёт и добавляет точку перемещения для указанного элемента.
     *
     * @param {Object} pointData - Данные точки перемещения.
     * @param {number} pointData.x - Координата X точки.
     * @param {number} pointData.y - Координата Y точки.
     * @param {string} pointData.parent_id - ID родительского элемента.
     * @param {number} pointData.point_num - Номер точки в массиве точек элемента.
     */
    function createMovePoint(pointData) {
        // Определяем цвет точки в зависимости от текущего состояния контроллера
        var pointColor = mainColors.move_point_default;
        if (
            Lo.is_controller_visible &&
            Lo.parent_id === pointData.parent_id &&
            Lo.point_num === pointData.point_num
        ) {
            pointColor = mainColors.move_point_current_pult;
        }

        // Создаём объект точки перемещения
        var movePoint = new Konva.Circle({
            x: pointData.x,
            y: pointData.y,
            radius: 4,
            fill: pointColor,
            stroke: "black",
            strokeWidth: 1,
            id: "movepoint_" + jo,
            parent_id: pointData.parent_id,
            visible: true,
            draggable: true,
            point_num: pointData.point_num
        });

        // Добавляем обработчики событий для точки перемещения
        movePoint.on("mouseover", function (event) {
            Ya(event);
        });
        movePoint.on("mouseout", function (event) {
            Da(event);
        });
        movePoint.on("dragstart", function (event) {
            Xa(event);
        });
        movePoint.on("dragend", function (event) {
            Ga(event);
        });
        movePoint.on("dragmove", function (event) {
            Wa(event.target, false, "dragmove");
        });
        movePoint.on("click", function (event) {
            Ka(event);
        });
        movePoint.on("mousemove", function (event) {
            handleCanvasMouseMove(event);
        });
        movePoint.on("mousedown", function (event) {
            be(event);
        });
        movePoint.on("mouseup", function (event) {
            ve(event);
        });
        movePoint.on("wheel", function (event) {
            we(event);
        });

        // Добавляем точку в слой и увеличиваем счётчик точек
        Zs[vo].add(movePoint);
        jo++;
    }

    function Ya(e) {
        var t = mainColors.move_point_default_hover;
        Lo.is_controller_visible && Lo.parent_id == e.target.attrs.parent_id && Lo.point_num == e.target.attrs.point_num && (t = mainColors.move_point_current_pult_hover), e.target.setAttrs({
            fill: t
        });
        try {
            e.target.draw()
        } catch (e) {
            console.log(e)
        }
    }

    function Da(e) {
        var t = mainColors.move_point_default;
        Lo.is_controller_visible && Lo.parent_id == e.target.attrs.parent_id && Lo.point_num == e.target.attrs.point_num && (t = mainColors.move_point_current_pult), e.target.setAttrs({
            fill: t
        });
        try {
            e.target.draw()
        } catch (e) {
            console.log(e)
        }
    }

    function Xa(e) {
        vi = {};
        var t = e.target;
        Lo.is_controller_visible && Lo.parent_id == t.attrs.parent_id && Lo.point_num == t.attrs.point_num || Ra(), $("#move_point_controller_submit_x").removeClass("active"), $("#move_point_controller_submit_y").removeClass("active");
        var _ = Bi.findOne("#" + t.attrs.parent_id),
            a = JSON.copy(_.points());
        di = {
            type: "h_pline_point_drag",
            need_layer_num: yo,
            need_tab_scale: Go.g_scale[vo],
            need_axis: {
                g_x: Fo[vo],
                g_y: Ao[vo],
                current_layer_name: vo
            },
            g_current_move_point_data: JSON.copy(Lo),
            pline_data: {
                id: _.attrs.id,
                points: {
                    before: a
                }
            }
        }, An({
            mode: "add",
            element: di
        })
    }

    function Ga(e) {
        vi = {}, da();
        var t = e.target,
            _ = Bi.findOne("#" + t.attrs.parent_id),
            a = JSON.copy(_.points());
        li[ci].pline_data.points.after = a, -1 !== $.inArray(ei.type, ["sznde"]) && (ms(), _n(_.id(), {
            mode: "update_considering_pline_breaks"
        }), rs(_), updateElementParametersDisplay(_), refreshCurrentLayer())
    }

    function Wa(e, t, _) {
        var a = {
                id: e.attrs.id,
                parent_id: e.attrs.parent_id,
                point_num: e.attrs.point_num,
                x: e.attrs.x,
                y: e.attrs.y
            },
            r;
        "dragmove" == _ ? (0 == Object.keys(vi).length && (vi = Bi.findOne("#" + a.parent_id)), r = vi) : r = Bi.findOne("#" + a.parent_id);
        var n = r.points();
        t && (di = {
            type: "h_pline_move_point_controller",
            need_layer_num: yo,
            need_tab_scale: Go.g_scale[vo],
            need_axis: {
                g_x: Fo[vo],
                g_y: Ao[vo],
                current_layer_name: vo
            },
            g_current_move_point_data: JSON.copy(Lo),
            pline_data: {
                id: r.attrs.id,
                points: {
                    before: JSON.copy(n)
                }
            }
        });
        var s = !1;
        if (0 == a.point_num && isPolylineClosed(n) && (s = !0), n[2 * a.point_num + 0] = a.x, n[2 * a.point_num + 1] = a.y, s) {
            var o = n.length;
            n[o - 2] = n[0], n[o - 1] = n[1]
        }
        r.setAttrs({
            points: n
        }), t && (di.pline_data.points.after = JSON.copy(n), An({
            mode: "add",
            element: di
        })), vt(r, !1), _n(r.id(), {
            mode: "update_considering_pline_breaks"
        }), processAndClearElement(r), Ma(e), r.draw()
    }

    function Ka(e) {
        var t = !1;
        if ("undefined" != typeof e.evt && "undefined" != typeof e.evt.button && 2 == e.evt.button && "default" == Oo.mode && (t = !0), "right_click" == bi && (t = !0), !t) ye(e);
        else if (-1 !== $.inArray(ei.type, ["roof"])) {
            bi = "", $a(), e.target.setAttrs({
                fill: mainColors.move_point_current_pult_hover
            });
            try {
                e.target.draw()
            } catch (e) {
                console.log(e)
            }
            Lo.is_controller_visible = !0, Lo.parent_id = e.target.attrs.parent_id, Lo.point_num = e.target.attrs.point_num, xi = Bi.findOne("#" + e.target.attrs.parent_id), wi = e.target.attrs.point_num - 1, Na(), Ma(e.target), $("#move_point_controller_submit_x").removeClass("active"), $("#move_point_controller_submit_y").removeClass("active"), $("#move_point_controller").show(), "block" == $("#figure_controller").css("display") && SimpleCad.Action({
                type: "figure_controller",
                mode: "close"
            }), "block" == $("#figure_move_controller").css("display") && SimpleCad.Action({
                type: "figure_move_controller",
                mode: "close"
            })
        }
    }

    function Na() {
        0 > wi && (isPolylineClosed(xi.attrs.points) ? wi = xi.attrs.points.length / 2 - 2 : wi = xi.attrs.points.length / 2 - 1)
    }

    function Va(e, t) {
        oo[vo].x.setPoints([0, t, Bi.width(), t]), oo[vo].y.setPoints([e, 0, e, Bi.height()]), oo[vo].x.show(), oo[vo].x.moveToTop(), oo[vo].y.show(), oo[vo].y.moveToTop(), Es[vo].moveToTop(), Zs[vo].moveToTop(), to[vo].batchDraw()
    }

    function $a() {
        $.each(Zs[vo].children, function(e, t) {
            t.fill(mainColors.move_point_default)
        }), Zs[vo].draw()
    }

    function Ea() {
        var e = null;
        return $.each(Zs[vo].children, function(t, _) {
            _.attrs.parent_id == Lo.parent_id && _.attrs.point_num == Lo.point_num && (e = _)
        }), e
    }

    function Ma(e) {
        if (Lo.is_controller_visible && Lo.parent_id == e.attrs.parent_id && Lo.point_num == e.attrs.point_num) {
            ol.val((100 * (e.attrs.x - Fo[vo]) / Go.g_scale[vo]).toFixed(3)), il.val((100 * (Ao[vo] - e.attrs.y) / Go.g_scale[vo]).toFixed(3));
            let t = xi.attrs.points[2 * wi],
                _ = xi.attrs.points[2 * wi + 1];
            ll.val((100 * (e.attrs.x - t) / Go.g_scale[vo]).toFixed(3)), cl.val((100 * (_ - e.attrs.y) / Go.g_scale[vo]).toFixed(3)), Va(t, _)
        }
    }

    function Ra() {
        Lo.is_controller_visible = !1, Lo.parent_id = "", Lo.point_num = -1, xi = {}, wi = -1, oo[vo].x.hide(), oo[vo].y.hide(), $("#move_point_controller").hide(), $a(), to[vo].batchDraw()
    }

    function Ha() {
        $("#figure_controller").hide()
    }

    function Ba(e) {
        var t = 0,
            _ = 0,
            a = 1;
        switch (e.direction) {
            case "up":
            case "down":
                _ = nn(e.overalls_local.y_max - e.overalls_local.y_min), "down" == e.direction && (a = -1);
                break;
            case "right":
            case "left":
                t = nn(e.overalls_local.x_max - e.overalls_local.x_min), "left" == e.direction && (a = -1);
                break;
            default:
        }
        for (var r = 0, n; r < e.count; r++) {
            switch (n = {
                    points: e.points,
                    offset_origin: {
                        x: 0,
                        y: 0
                    },
                    is_offset_origin_add: !0,
                    offset_origin_set: {
                        x: 0,
                        y: 0
                    },
                    is_offset_origin_set: !0
                }, e.direction) {
                case "up":
                case "down":
                    n.offset_origin.y = a * (1 + r) * nn(_ + e.distance);
                    break;
                case "right":
                case "left":
                    n.offset_origin.x = a * (1 + r) * nn(t + e.distance);
                    break;
                default:
            }
            n.offset_origin_set = {
                x: nn(e.offset_origin.x + n.offset_origin.x),
                y: nn(e.offset_origin.y + n.offset_origin.y)
            };
            var s = createPolyline(JSON.copy(n));
            oa(s), to[vo].batchDraw(), e.is_history && di.plines_data.push({
                id: s.attrs.id,
                name: s.attrs.name,
                points: JSON.copy(s.attrs.points),
                offset_origin: JSON.copy(s.attrs.offset_origin),
                is_offset_origin_add: !1
            })
        }
    }

    function Za(e) {
        switch (e.mode) {
            case "close":
                Ja(), ua(), zi = "";
                break;
            case "regard_prev":
                if ("" != zi) {
                    ki -= 1;
                    var t = Bi.findOne("#" + zi),
                        _ = t.points();
                    0 > ki && (isPolylineClosed(_) ? ki = _.length / 2 - 2 : ki = _.length / 2 - 1), Qa(t.points())
                }
                break;
            case "regard_next":
                if ("" != zi) {
                    ki += 1;
                    var t = Bi.findOne("#" + zi),
                        _ = t.points();
                    isPolylineClosed(_) ? ki >= _.length / 2 - 1 && (ki = 0) : ki >= _.length / 2 && (ki = 0), Qa(t.points())
                }
                break;
            case "focus":
                e.thisObject.select();
                break;
            case "blur":
                var a = e.thisObject.val() + "",
                    r = U(a);
                e.thisObject.val(r);
                break;
            case "submit_point":
                if ("" != zi && 0 <= ki) {
                    var n = U(jl.val() + ""),
                        s = U(Cl.val() + "");
                    jl.val(n), Cl.val(s);
                    var o = parseInt(Math.round(1e3 * n)),
                        l = parseInt(Math.round(1e3 * s));
                    o = o * Go.g_scale[vo] / 100000 + Fo[vo], l = Ao[vo] - l * Go.g_scale[vo] / 100000;
                    var c = Bi.findOne("#" + zi),
                        _ = c.points(),
                        d = _[2 * ki],
                        p = _[2 * ki + 1],
                        m = o - d,
                        h = l - p;
                    di = {
                        type: "figure_move_by_point",
                        need_layer_num: yo,
                        need_tab_scale: Go.g_scale[vo],
                        need_axis: {
                            g_x: Fo[vo],
                            g_y: Ao[vo],
                            current_layer_name: vo
                        },
                        g_context_element_id: zi,
                        g_figure_move_current_point_num: ki,
                        pline_data: {
                            id: c.attrs.id,
                            points: {
                                before: JSON.copy(_)
                            }
                        }
                    };
                    for (var u = 0; u < _.length; u += 2) _[u] += m, _[u + 1] += h;
                    c.setPoints(_), SimpleCad.Action({
                        type: "figure_move_controller",
                        mode: "update_element",
                        element: c,
                        points: _
                    }), di.pline_data.points.after = JSON.copy(_), An({
                        mode: "add",
                        element: di
                    })
                }
                break;
            case "submit_delta":
                if ("" != zi) {
                    var f = U($("#figure_move_controller_delta_x").val() + ""),
                        g = U($("#figure_move_controller_delta_y").val() + "");
                    $("#figure_move_controller_delta_x").val(f), $("#figure_move_controller_delta_y").val(g);
                    var m = parseInt(Math.round(1e3 * f)),
                        h = parseInt(Math.round(1e3 * g)),
                        y = m * Go.g_scale[vo] / 100000,
                        b = h * Go.g_scale[vo] / 100000,
                        c = Bi.findOne("#" + zi),
                        _ = c.points(),
                        v = _.length;
                    di = {
                        type: "figure_move_by_delta",
                        need_layer_num: yo,
                        need_tab_scale: Go.g_scale[vo],
                        need_axis: {
                            g_x: Fo[vo],
                            g_y: Ao[vo],
                            current_layer_name: vo
                        },
                        g_context_element_id: zi,
                        g_figure_move_current_point_num: ki,
                        pline_data: {
                            id: c.attrs.id,
                            points: {
                                before: JSON.copy(_)
                            }
                        }
                    };
                    for (var u = 0; u < v; u += 2) _[u] += y, _[u + 1] -= b;
                    c.setPoints(_), SimpleCad.Action({
                        type: "figure_move_controller",
                        mode: "update_element",
                        element: c,
                        points: _
                    }), di.pline_data.points.after = JSON.copy(_), An({
                        mode: "add",
                        element: di
                    })
                }
                break;
            case "up":
            case "right":
            case "down":
            case "left":
                if ("" != zi) {
                    var x = parseInt(pl.val()),
                        w = x * Go.g_scale[vo] / 100000,
                        c = Bi.findOne("#" + zi),
                        _ = c.points(),
                        v = _.length;
                    di = {
                        type: "figure_move_by_step",
                        need_layer_num: yo,
                        need_tab_scale: Go.g_scale[vo],
                        need_axis: {
                            g_x: Fo[vo],
                            g_y: Ao[vo],
                            current_layer_name: vo
                        },
                        g_context_element_id: zi,
                        g_figure_move_current_point_num: ki,
                        pline_data: {
                            id: c.attrs.id,
                            points: {
                                before: JSON.copy(_)
                            }
                        }
                    };
                    for (var u = 0; u < v; u += 2) switch (e.mode) {
                        case "up":
                            _[u + 1] -= w;
                            break;
                        case "down":
                            _[u + 1] += w;
                            break;
                        case "left":
                            _[u] -= w;
                            break;
                        case "right":
                            _[u] += w;
                            break;
                        default:
                    }
                    c.setPoints(_), SimpleCad.Action({
                        type: "figure_move_controller",
                        mode: "update_element",
                        element: c,
                        points: _
                    }), di.pline_data.points.after = JSON.copy(_), An({
                        mode: "add",
                        element: di
                    })
                }
                break;
            case "step":
                var k = $("#figure_move_controller_step_btn").html();
                switch (k) {
                    case "1 \u043C\u043C":
                        $("#figure_move_controller_step_btn").html("1 \u0441\u043C"), pl.val("10");
                        break;
                    case "1 \u0441\u043C":
                        $("#figure_move_controller_step_btn").html("10 \u0441\u043C"), pl.val("100");
                        break;
                    case "10 \u0441\u043C":
                        $("#figure_move_controller_step_btn").html("1 \u043C"), pl.val("1000");
                        break;
                    case "1 \u043C":
                        $("#figure_move_controller_step_btn").html("1 \u043C\u043C"), pl.val("1");
                        break;
                    default:
                }
                break;
            case "update_element":
                processAndClearElement(e.element), vt(e.element, !1), processElementAndAddMovePoints(e.element, !1), da(), Qa(e.points), to[vo].draw();
                break;
            default:
        }
    }

    function Ja() {
        $("#figure_move_controller").hide(), ki = -1
    }

    function Qa(e) {
        if ("" != zi && 0 <= ki) {
            var t = e[2 * ki],
                _ = e[2 * ki + 1];
            Va(t, _), jl.val((100 * (t - Fo[vo]) / Go.g_scale[vo]).toFixed(3)), Cl.val((100 * (Ao[vo] - _) / Go.g_scale[vo]).toFixed(3))
        }
    }

    function Ua(e) {
        switch (e.mode) {
            case "add_context_click":
                "" != zi && (kl.hide(), $o = !1, Eo = "relatively_element", el.find("[data-element=\"figure\"]").trigger("click"));
                break;
            case "copy_context_click":
                "" != zi && (kl.hide(), $o = !1, $("#figure_controller").show(), "block" == $("#move_point_controller").css("display") && SimpleCad.Action({
                    type: "move_point_controller",
                    mode: "close"
                }), "block" == $("#figure_move_controller").css("display") && SimpleCad.Action({
                    type: "figure_move_controller",
                    mode: "close"
                }));
                break;
            case "move_context_click":
                if ("" != zi) {
                    "undefined" == typeof e.is_calc_pline_bottom_left_point && (e.is_calc_pline_bottom_left_point = !0), kl.hide(), $o = !1, $("#figure_move_controller").show(), "block" == $("#move_point_controller").css("display") && SimpleCad.Action({
                        type: "move_point_controller",
                        mode: "close"
                    }), "block" == $("#figure_controller").css("display") && SimpleCad.Action({
                        type: "figure_controller",
                        mode: "close"
                    });
                    var t = Bi.findOne("#" + zi),
                        _ = t.points(),
                        a = $t(_);
                    e.is_calc_pline_bottom_left_point && (ki = a.point_num), Qa(t.points())
                }
                break;
            case "copy":
                if ("" != zi) {
                    var r = Ct({
                        filter_id: zi,
                        what: ["pline_points", "pline_points_x_y", "pline_id", "is_object_visible", "pline_is_closed", "pline_scale", "pline_roof_calc", "offset_origin"]
                    });
                    if (1 == r.length) {
                        var n = parseInt($("#figure_controller_count").val());
                        0 >= n && (n = 1);
                        var s = parseFloat(($("#figure_controller_distance").val() + "").replace(",", "."));
                        0 > s && (s = 0);
                        var o = $("#figure_controller_direction").val();
                        di = {
                            type: "h_figure_copy",
                            need_layer_num: yo,
                            need_tab_scale: Go.g_scale[vo],
                            need_axis: {
                                g_x: Fo[vo],
                                g_y: Ao[vo],
                                current_layer_name: vo
                            },
                            plines_data: []
                        }, Ba({
                            points: r[0].points,
                            offset_origin: JSON.copy(r[0].offset_origin),
                            count: n,
                            distance: s,
                            direction: o,
                            overalls_local: JSON.copy(r[0].overalls_local),
                            is_history: !0
                        }), An({
                            mode: "add",
                            element: di
                        }), zi = ""
                    }
                }
                Ha();
                break;
            case "up":
            case "down":
            case "left":
            case "right":
                $("#figure_controller_direction").val(e.mode), $("#figure_controller").find(".d_move_point_controller_arrow").removeClass("active"), $("#figure_controller").find(".d_move_point_controller_arrow_" + e.mode).addClass("active");
                break;
            case "close":
                Ha(), ua();
                break;
            case "keyup":
                var i = e.eventObject.keyCode;
                13 == i && SimpleCad.Action({
                    type: "figure_controller",
                    mode: "copy"
                });
                break;
            default:
        }
    }

    function er(e) {
        switch (e.mode) {
            case "step":
                var t = $("#move_point_controller_step_btn").html();
                switch (t) {
                    case "1 \u043C\u043C":
                        $("#move_point_controller_step_btn").html("1 \u0441\u043C"), dl.val("10");
                        break;
                    case "1 \u0441\u043C":
                        $("#move_point_controller_step_btn").html("10 \u0441\u043C"), dl.val("100");
                        break;
                    case "10 \u0441\u043C":
                        $("#move_point_controller_step_btn").html("1 \u043C"), dl.val("1000");
                        break;
                    case "1 \u043C":
                        $("#move_point_controller_step_btn").html("1 \u043C\u043C"), dl.val("1");
                        break;
                    default:
                }
                break;
            case "close":
                Ra();
                break;
            case "up":
            case "down":
            case "left":
            case "right":
                var _ = Ea();
                if (null !== _ && "undefined" != typeof _ && "Circle" == _.className) {
                    var a = parseInt(dl.val()),
                        r = a * Go.g_scale[vo] / 100000;
                    switch (e.mode) {
                        case "up":
                            _.setAttrs({
                                y: _.y() - r
                            });
                            break;
                        case "down":
                            _.setAttrs({
                                y: _.y() + r
                            });
                            break;
                        case "left":
                            _.setAttrs({
                                x: _.x() - r
                            });
                            break;
                        case "right":
                            _.setAttrs({
                                x: _.x() + r
                            });
                            break;
                        default:
                    }
                    Wa(_, !0, "u_d_l_r"), to[vo].draw(), da()
                }
                break;
            case "input":
                $("#move_point_controller_submit_" + e.param).hasClass("active") || $("#move_point_controller_submit_" + e.param).addClass("active");
                var n = "";
                $.each($(".js_one_submit_yes_no"), function(t, _) {
                    n = _.attributes.id.value, n = n.replace("move_point_controller_submit_", ""), n != e.param && $("#move_point_controller_submit_" + n).hasClass("active") && SimpleCad.Action({
                        type: "move_point_controller",
                        param: n,
                        mode: "cancel"
                    })
                });
                break;
            case "keyup":
                var s = e.eventObject.keyCode;
                13 == s ? SimpleCad.Action({
                    type: "move_point_controller",
                    param: e.param,
                    mode: "submit"
                }) : 27 == s && SimpleCad.Action({
                    type: "move_point_controller",
                    param: e.param,
                    mode: "cancel"
                });
                break;
            case "cancel":
                var _ = Ea();
                switch (e.param) {
                    case "x":
                        $("#move_point_controller_submit_x").removeClass("active"), ol.val((100 * (_.attrs.x - Fo[vo]) / Go.g_scale[vo]).toFixed(3));
                        break;
                    case "y":
                        $("#move_point_controller_submit_y").removeClass("active"), il.val((100 * (Ao[vo] - _.attrs.y) / Go.g_scale[vo]).toFixed(3));
                        break;
                    case "xp":
                        $("#move_point_controller_submit_xp").removeClass("active");
                        var o = xi.attrs.points[2 * wi];
                        ll.val((100 * (_.attrs.x - o) / Go.g_scale[vo]).toFixed(3));
                        break;
                    case "yp":
                        $("#move_point_controller_submit_yp").removeClass("active");
                        var i = xi.attrs.points[2 * wi + 1];
                        cl.val((100 * (i - _.attrs.y) / Go.g_scale[vo]).toFixed(3));
                        break;
                    default:
                }
                break;
            case "submit":
                var _ = Ea(),
                    l = 1e3 * U($("#move_point_controller_" + e.param).val()),
                    c = l * Go.g_scale[vo] / 100000;
                switch (e.param) {
                    case "x":
                        _.setAttrs({
                            x: c + Fo[vo]
                        });
                        break;
                    case "y":
                        _.setAttrs({
                            y: Ao[vo] - c
                        });
                        break;
                    case "xp":
                        let t = xi.attrs.points[2 * wi];
                        _.setAttrs({
                            x: c + t
                        });
                        break;
                    case "yp":
                        let a = xi.attrs.points[2 * wi + 1];
                        _.setAttrs({
                            y: a - c
                        });
                        break;
                    default:
                }
                $("#move_point_controller_submit_" + e.param).removeClass("active"), Wa(_, !0, "submit"), to[vo].draw(), da();
                break;
            case "regard_prev":
                wi -= 1, Na();
                var d = Ea();
                Ma(d);
                break;
            case "regard_next":
                wi += 1, isPolylineClosed(xi.attrs.points) ? wi >= xi.attrs.points.length / 2 - 1 && (wi = 0) : wi >= xi.attrs.points.length / 2 && (wi = 0);
                var d = Ea();
                Ma(d);
                break;
            default:
        }
    }

    function tr(e) {
        "undefined" != typeof e.is_controller_visible && "undefined" != typeof e.parent_id && "undefined" != typeof e.point_num && e.is_controller_visible && "" != e.parent_id && $.each(Zs[vo].children, function(t, _) {
            if (_.attrs.parent_id == e.parent_id && _.attrs.point_num == e.point_num) return bi = "right_click", void _.fire("click")
        })
    }

    function _r(e) {
        var t = e.thisObject,
            _ = t.prop("checked");
        switch (e.mode) {
            case "all":
                $("[data-chb-gr=\"" + e.group + "\"]").prop("checked", _);
                break;
            case "one":
                break;
            default:
        }
        if ("undefined" != typeof e.after) switch (e.after) {
            case "roof_specification_full_project_chb_changed":
                $("#roof_specification_full_project_chb_changed__loading").show(), setTimeout(function() {
                    Tr(), Ir(), ar("checkbox_changed"), $("#roof_specification_full_project_chb_changed__loading").hide()
                }, 10);
                break;
            case "roof_specification_full_project_pdf_form_filters_chb_changed":
                Ar(), SimpleCad.Action({
                    type: "roof_specification_full_project_pdf_remove"
                }), qr();
                break;
            default:
        }
    }

    function ar() {
        if ("[]" != Mo.sheet_allowed_length_edit && (-1 !== $.inArray(Mo.type, ["siding", "siding_vert"]) || "mch" == Mo.type && "warehouse_cutted_schemed" == Mo.mch_edited_shal_calc_mode)) {
            var e = [];
            $.each(ni.sheets_filtered_sorted_grouped, function(t, _) {
                e.push({
                    size: parseInt(Math.round(1e3 * _.size)),
                    amount: parseInt(_.amount)
                })
            });
            var t = [],
                _ = JSON.parse(Mo.sheet_allowed_length_edit);
            $.each(_, function(e, _) {
                t.push({
                    size: parseInt(_),
                    amount: 99999
                })
            });
            var a = rr(e, t);
            Or(a)
        }
    }

    function rr(e, t) {
        if (nr(e, t), 0 == e.length) return JSON.copy(Di);
        if (sr(), or(), ir(), lr(), cr(), dr(), pr(), mr(), br(), vr(), xr(), wr(), kr(), zr(), jr(), Cr(), Lr(), 0 < Ki.length) {
            var _ = {
                errors: Ki
            };
            N("backent_ajax_error_warehouse_cutting_scheme", _), $("#roof_specification_full_project_table_err_ul").html("<li><i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i> \u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435, \u0434\u0430\u043D\u043D\u044B\u0435 \u0440\u0430\u0441\u043A\u0440\u043E\u044F \u043C\u043E\u0433\u0443\u0442 \u0431\u044B\u0442\u044C \u043D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u043C\u0438. \u041F\u0440\u0438 \u0432\u044B\u0447\u0438\u0441\u043B\u0435\u043D\u0438\u0438 \u0440\u0430\u0441\u043A\u0440\u043E\u044F \u0432\u043E\u0437\u043D\u0438\u043A\u043B\u0430 \u043E\u0448\u0438\u0431\u043A\u0430. \u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0443 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435. " + Ki.join(",") + "</li>")
        }
        return JSON.copy(Di)
    }

    function nr(e, t) {
        switch (Ti = JSON.copy(e), Si = JSON.copy(t), Pi = [], Ii = [], Yi = 0, Di = {
                positions: [],
                sizes: []
            }, Xi = 0, Gi = 0, Wi = 0, Ki = [], $i = !1, Mo.type) {
            case "siding":
            case "siding_vert":
                Vi = "siding";
                break;
            case "mch":
                Vi = "mch", $.each(Si, function(e, t) {
                    0 == t.size % Mo.wave_length && ($i = !0)
                });
                break;
            default:
        }
    }

    function sr() {
        $.each(Ti, function(e) {
            Ti[e].done = 0
        }), $.each(Si, function(e, t) {
            Pi.push(t.size)
        })
    }

    function or() {
        Ti.sort(function(e, t) {
            return t.size - e.size
        }), Si.sort(function(e, t) {
            return t.size - e.size
        }), Yi = Ti[Ti.length - 1].size, Xi = Ti.length, Gi = Si[Si.length - 1].size, Wi = Si[0].size, Ii = JSON.copy(Pi), Ii.sort(function(e, t) {
            return e - t
        })
    }

    function ir() {
        Ni.do_equal_stat && console.log("DoEqual ----");
        var e = 0;
        $.each(Ti, function(t, _) {
            if (_.amount > _.done)
                if (-1 < Pi.indexOf(_.size))
                    for (; Ti[t].amount > Ti[t].done;) Di.positions.push({
                        size: _.size,
                        cuts: [_.size],
                        waste: 0,
                        cuts_cnt: 0,
                        stop: 1
                    }), Ti[t].done++, Ni.do_equal_stat && console.log(Di.positions.slice(-1));
                else if (Wi - _.size < Mo.sheet_min_length_tech) {
                switch (Vi) {
                    case "mch":
                        e = 0;
                        break;
                    case "siding":
                        e = Wi - _.size;
                        break;
                    default:
                }
                for (; Ti[t].amount > Ti[t].done;) Di.positions.push({
                    size: Wi,
                    cuts: [_.size],
                    waste: e,
                    cuts_cnt: 1,
                    stop: 1
                }), Ti[t].done++, Ni.do_equal_stat && console.log(Di.positions.slice(-1))
            }
        })
    }

    function lr() {
        if (Ni.do_equal_stat && console.log("DoEqualMultiples ----"), "mch" != Vi || !1 !== $i)
            for (var e = 0, t = 0, _ = [], a = [], r = 0, n = 0, s = {}, o = !1, l = 0; 100 > l; l++) o = !1, $.each(Ti, function(i, l) {
                if (l.amount > l.done && (e = l.amount - l.done, t = 0, _ = [], a = [], r = 0, n = 0, $.each(Si, function(r, n) {
                        t = n.size / l.size, 0 == n.size % l.size && e >= t && ("siding" == Vi || "mch" == Vi && 0 == n.size % Mo.wave_length && 0 == l.size % Mo.wave_length) && (0 == e % t ? a.push(n.size) : _.push(n.size))
                    }), 0 < a.length ? r = a[0] : 0 < _.length && (r = _[0]), 0 < r)) {
                    t = r / l.size, n = Math.floor(e / t);
                    for (var c = 0; c < n; c++) {
                        s = {
                            size: r,
                            cuts: [],
                            waste: 0,
                            cuts_cnt: t - 1,
                            stop: 1
                        };
                        for (var d = 0; d < t; d++) s.cuts.push(l.size), Ti[i].done++;
                        Di.positions.push(s), o = !0, Ni.do_equal_stat && console.log(Di.positions.slice(-1))
                    }
                }
            }), o || (l = 9999)
    }

    function cr() {
        Ni.do_equal_stat && console.log("DoSumTwoEqual ----");
        for (var e = {}, t = 0, _ = 0, a = 0, r = "", n = 0, s = 0; s < Xi; s++)
            if (Ti[s].amount > Ti[s].done) {
                t = Ti[s].size;
                for (var o = s + 1; o < Xi; o++) Ti[o].amount > Ti[o].done && (_ = Ti[o].size, a = t + _, a <= Wi && a >= Gi && ("mch" == Vi && (n = 0, 0 == t % Mo.wave_length && n++, 0 == _ % Mo.wave_length && n++), ("siding" == Vi || "mch" == Vi && 1 <= n) && $.each(Si, function(r, n) {
                    a == n.size && (e[t + "_" + _] = a)
                })))
            } if (0 < Object.keys(e).length)
            for (var s = 0; s < Xi; s++)
                if (Ti[s].amount > Ti[s].done) {
                    t = Ti[s].size;
                    for (var o = s + 1; o < Xi; o++)
                        if (Ti[o].amount > Ti[o].done && (_ = Ti[o].size, r = t + "_" + _, "undefined" != typeof e[r]))
                            for (var i = 0; 1e3 > i; i++) Ti[s].done++, Ti[o].done++, Ti[s].amount >= Ti[s].done && Ti[o].amount >= Ti[o].done ? (Di.positions.push({
                                size: e[r],
                                cuts: [t, _],
                                waste: 0,
                                cuts_cnt: 1,
                                stop: 1
                            }), Ni.do_equal_stat && console.log(Di.positions.slice(-1))) : (Ti[s].done--, Ti[o].done--, i = 9999)
                }
    }

    function dr() {
        Ni.do_equal_stat && console.log("DoSumThreeEqual ----");
        for (var e = {}, t = 0, _ = 0, a = 0, r = 0, n = "", s = 0, o = 0; o < Xi; o++)
            if (Ti[o].amount > Ti[o].done) {
                t = Ti[o].size;
                for (var i = 0; i < Xi; i++)
                    if (Ti[i].amount > Ti[i].done) {
                        _ = Ti[i].size;
                        for (var l = 0; l < Xi; l++) Ti[l].amount > Ti[l].done && (a = Ti[l].size, r = t + _ + a, r <= Wi && r >= Gi && ("mch" == Vi && (s = 0, 0 == t % Mo.wave_length && s++, 0 == _ % Mo.wave_length && s++, 0 == a % Mo.wave_length && s++), ("siding" == Vi || "mch" == Vi && 2 <= s) && $.each(Si, function(n, s) {
                            r == s.size && (e[t + "_" + _ + "_" + a] = r)
                        })))
                    }
            } if (0 < Object.keys(e).length)
            for (var o = 0; o < Xi; o++)
                if (Ti[o].amount > Ti[o].done) {
                    t = Ti[o].size;
                    for (var i = 0; i < Xi; i++)
                        if (Ti[i].amount > Ti[i].done) {
                            _ = Ti[i].size;
                            for (var l = 0; l < Xi; l++)
                                if (Ti[l].amount > Ti[l].done && (a = Ti[l].size, n = t + "_" + _ + "_" + a, "undefined" != typeof e[n]))
                                    for (var c = 0; 1e3 > c; c++) Ti[o].done++, Ti[i].done++, Ti[l].done++, Ti[o].amount >= Ti[o].done && Ti[i].amount >= Ti[i].done && Ti[l].amount >= Ti[l].done ? (Di.positions.push({
                                        size: e[n],
                                        cuts: [t, _, a],
                                        waste: 0,
                                        cuts_cnt: 2,
                                        stop: 1
                                    }), Ni.do_equal_stat && console.log(Di.positions.slice(-1))) : (Ti[o].done--, Ti[i].done--, Ti[l].done--, c = 9999)
                        }
                }
    }

    function pr() {
        Ni.do_equal_stat && console.log("DoSumFourEqual ----");
        for (var e = {}, t = 0, _ = 0, a = 0, r = 0, n = 0, s = "", o = 0, i = 0; i < Xi; i++)
            if (Ti[i].amount > Ti[i].done) {
                t = Ti[i].size;
                for (var l = 0; l < Xi; l++)
                    if (Ti[l].amount > Ti[l].done) {
                        _ = Ti[l].size;
                        for (var c = 0; c < Xi; c++)
                            if (Ti[c].amount > Ti[c].done) {
                                a = Ti[c].size;
                                for (var d = 0; d < Xi; d++) Ti[d].amount > Ti[d].done && (r = Ti[d].size, n = t + _ + a + r, n <= Wi && n >= Gi && ("mch" == Vi && (o = 0, 0 == t % Mo.wave_length && o++, 0 == _ % Mo.wave_length && o++, 0 == a % Mo.wave_length && o++, 0 == r % Mo.wave_length && o++), ("siding" == Vi || "mch" == Vi && 3 <= o) && $.each(Si, function(s, o) {
                                    n == o.size && (e[t + "_" + _ + "_" + a + "_" + r] = n)
                                })))
                            }
                    }
            } if (0 < Object.keys(e).length)
            for (var i = 0; i < Xi; i++)
                if (Ti[i].amount > Ti[i].done) {
                    t = Ti[i].size;
                    for (var l = 0; l < Xi; l++)
                        if (Ti[l].amount > Ti[l].done) {
                            _ = Ti[l].size;
                            for (var c = 0; c < Xi; c++)
                                if (Ti[c].amount > Ti[c].done) {
                                    a = Ti[c].size;
                                    for (var d = 0; d < Xi; d++)
                                        if (Ti[d].amount > Ti[d].done && (r = Ti[d].size, s = t + "_" + _ + "_" + a + "_" + r, "undefined" != typeof e[s]))
                                            for (var p = 0; 1e3 > p; p++) Ti[i].done++, Ti[l].done++, Ti[c].done++, Ti[d].done++, Ti[i].amount >= Ti[i].done && Ti[l].amount >= Ti[l].done && Ti[c].amount >= Ti[c].done && Ti[d].amount >= Ti[d].done ? (Di.positions.push({
                                                size: e[s],
                                                cuts: [t, _, a, r],
                                                waste: 0,
                                                cuts_cnt: 3,
                                                stop: 1
                                            }), Ni.do_equal_stat && console.log(Di.positions.slice(-1))) : (Ti[i].done--, Ti[l].done--, Ti[c].done--, Ti[d].done--, p = 9999)
                                }
                        }
                }
    }

    function mr() {
        Ni.do_equal_stat && console.log("DoLast ----"), $.each(Ti, function(e, t) {
            if (t.amount > t.done)
                for (; Ti[e].amount > Ti[e].done;) hr(t.size, e)
        })
    }

    function hr(e, t) {
        var _ = fr(e, -1); - 1 < _.pos_min_waste_after_insert__index ? gr({
            pos: _.pos_min_waste_after_insert__index,
            length: e,
            waste: _.pos_min_waste_after_insert__val,
            waste_real: _.pos_min_waste_after_insert__val_real
        }) : yr(e), Ti[t].done++
    }

    function ur(e, t) {
        var _ = 0,
            a = e % Mo.wave_length,
            r = t % Mo.wave_length;
        return a >= r ? (_ = e - (a - r), _ -= t, _ -= _ % Mo.wave_length) : _ = e - t - (Mo.wave_length - t % Mo.wave_length), _ < Mo.sheet_min_length_tech && (_ = 0), _
    }

    function fr(e, t) {
        var _ = -1,
            a = 1e9,
            r = 1e9,
            n = 0,
            s = -1,
            o = -1;
        return $.each(Di.positions, function(i, l) {
            if (0 == l.stop && i != t && l.waste >= e) {
                switch (n = l.waste - e, Vi) {
                    case "siding":
                        break;
                    case "mch":
                        o = ur(l.waste, e);
                        break;
                    default:
                }
                n < a ? (a = n, _ = i, r = l.cuts_cnt, s = o) : n == a && l.cuts_cnt < r && (_ = i, r = l.cuts_cnt, s = o)
            }
        }), {
            pos_min_waste_after_insert__index: _,
            pos_min_waste_after_insert__val: a,
            pos_min_waste_after_insert__val_real: s
        }
    }

    function gr(e) {
        var t = 0;
        switch (Vi) {
            case "siding":
                t = e.waste;
                break;
            case "mch":
                t = e.waste_real;
                break;
            default:
        }
        Di.positions[e.pos].cuts.push(e.length), Di.positions[e.pos].waste = t, 0 < e.waste && Di.positions[e.pos].cuts_cnt++, t < Yi && (Di.positions[e.pos].stop = 1), Ni.do_equal_stat && (console.log("InsertToWasteOnPos"), console.log(Di.positions.slice(e.pos, e.pos + 1)))
    }

    function yr(e) {
        var t = Si[0].size,
            _ = 0;
        switch (Vi) {
            case "siding":
                _ = t - e;
                break;
            case "mch":
                _ = ur(t, e);
                break;
            default:
        }
        Di.positions.push({
            size: t,
            cuts: [e],
            waste: _,
            cuts_cnt: 1,
            stop: _ < Yi ? 1 : 0
        }), Ni.do_equal_stat && (console.log("AddNew"), console.log(Di.positions.slice(-1)))
    }

    function br() {
        $.each(Di.positions, function(e, t) {
            Di.positions[e].cuts_sum = t.cuts.reduce(function(e, t) {
                return e + t
            })
        })
    }

    function vr() {
        Ni.do_equal_stat && console.log("ReduceSize ----");
        var e = 0;
        $.each(Di.positions, function(t, _) {
            _.size > Gi && $.each(Ii, function(a, r) {
                if (r >= _.size) return !1;
                if ("siding" == Vi) {
                    if (_.cuts_sum <= r) return Di.positions[t].size = r, Di.positions[t].waste = r - _.cuts_sum, Di.positions[t].stop = Di.positions[t].waste < Yi ? 1 : 0, Ni.do_equal_stat && console.log(Di.positions.slice(t, t + 1)), !1;
                } else if ("mch" == Vi && (e = 0, $.each(_.cuts, function(t, _) {
                        e += _ - _ % Mo.wave_length + Mo.wave_length
                    }), e <= r)) return Di.positions[t].size = r, Di.positions[t].waste = r - e, Di.positions[t].waste < Mo.sheet_min_length_tech && (Di.positions[t].waste = 0), Di.positions[t].stop = Di.positions[t].waste < Yi ? 1 : 0, Ni.do_equal_stat && console.log(Di.positions.slice(t, t + 1)), !1
            })
        })
    }

    function xr() {
        Ni.do_equal_stat && console.log("MoveToWastes ----");
        for (var e = [], t = 0, _ = 0, a = !0, r = !0, n = 0, s = [], o = [], i = {}, l = !1, c = !1, d = 0; 1e3 > d; d++) l = !1, Di.positions.sort(function(e, t) {
            return t.cuts_cnt - e.cuts_cnt
        }), $.each(Di.positions, function(d, p) {
            if (0 < p.size && (e = [], $.each(Di.positions, function(t, _) {
                    d != t && 0 < _.waste && e.push(_.waste)
                }), 0 < e.length && (e.sort(function(e, t) {
                    return e - t
                }), t = e[0], _ = e[e.length - 1], a = !0, $.each(p.cuts, function(e, r) {
                    if (r < t || r > _) return a = !1, !1
                }), a && (r = !0, n = 0, s = JSON.copy(p.cuts), o = JSON.copy(e), s.sort(function(e, t) {
                    return t - e
                }), o.sort(function(e, t) {
                    return e - t
                }), $.each(s, function(e, t) {
                    $.each(o, function(e, _) {
                        if (t <= _) {
                            switch (Vi) {
                                case "siding":
                                    o[e] = _ - t;
                                    break;
                                case "mch":
                                    o[e] = ur(_, t);
                                    break;
                                default:
                            }
                            return n++, !1
                        }
                    })
                }), n < s.length && (r = !1), r && ($.each(p.cuts, function(e, t) {
                    i = {}, i = fr(t, d), -1 < i.pos_min_waste_after_insert__index ? gr({
                        pos: i.pos_min_waste_after_insert__index,
                        length: t,
                        waste: i.pos_min_waste_after_insert__val,
                        waste_real: i.pos_min_waste_after_insert__val_real
                    }) : Ki.push("#wh_e1")
                }), Di.positions[d] = {
                    size: 0,
                    cuts: [],
                    waste: 0,
                    cuts_cnt: 0,
                    stop: 1
                }, l = !0, c = !0)))), l) return !1
        }), l || (d = 9999);
        if (c) {
            var p = JSON.copy(Di.positions);
            delete Di.positions, Di.positions = [], $.each(p, function(e, t) {
                0 < t.size && Di.positions.push(t)
            })
        }
    }

    function wr() {
        $.each(Di.positions, function(e) {
            Di.positions[e].cuts.sort(function(e, t) {
                return t - e
            })
        })
    }

    function kr() {
        var e = {},
            t = "";
        $.each(Di.positions, function(_, a) {
            t = "s_" + a.size + "_c_" + a.cuts.join("_") + "_w_" + a.waste, "undefined" == typeof e[t] ? (a.count = 1, e[t] = JSON.copy(a)) : e[t].count++
        }), delete Di.positions, Di.positions = [], $.each(e, function(e, t) {
            Di.positions.push(t)
        })
    }

    function zr() {
        Di.positions.sort(function(e, t) {
            return e.size < t.size ? -1 : e.size > t.size ? 1 : e.waste < t.waste ? -1 : e.waste > t.waste ? 1 : e.cuts_cnt < t.cuts_cnt ? -1 : e.cuts_cnt > t.cuts_cnt ? 1 : e.count < t.count ? -1 : e.count > t.count ? 1 : 0
        })
    }

    function jr() {
        var e = 0,
            t = "";
        $.each(Di.positions, function(_, a) {
            0 == _ ? 1 == a.count ? (t = "1", e = 1) : (t = "1 - " + a.count, e = a.count) : 1 == a.count ? (e += 1, t = e) : (t = e + 1 + " - " + (e + a.count), e += a.count), Di.positions[_].n_text = t
        })
    }

    function Cr() {
        var e = {},
            t = "";
        $.each(Di.positions, function(_, a) {
            t = "s_" + a.size, "undefined" == typeof e[t] ? e[t] = {
                size: a.size,
                count: a.count
            } : e[t].count += a.count
        }), $.each(e, function(e, t) {
            Di.sizes.push(t)
        }), Di.sizes.sort(function(e, t) {
            return e.size - t.size
        })
    }

    function Lr() {
        $.each(Ti, function(e, t) {
            if (t.amount != t.done) return Ki.push("#wh_e2"), !1
        });
        var e = {},
            t = "",
            _ = [];
        if ($.each(Di.positions, function(_, a) {
                $.each(a.cuts, function(_, r) {
                    t = "k_" + r, "undefined" == typeof e[t] ? e[t] = {
                        size: r,
                        amount: a.count
                    } : e[t].amount += a.count
                })
            }), $.each(e, function(e, t) {
                _.push(t)
            }), Ti.sort(function(e, t) {
                return e.size - t.size
            }), _.sort(function(e, t) {
                return e.size - t.size
            }), Ti.length != _.length) return void Ki.push("#wh_e3");
        for (var a = 0; a < Ti.length; a++)(Ti[a].size != _[a].size || Ti[a].amount != _[a].amount) && (Ki.push("#wh_e4"), a = Ti.length + 1)
    }

    function Or(e) {
        if (0 == e.positions.length) $("#roof_specification_table_warehouse_cutting_itog___tbody").html(""), $("#roof_specification_table_warehouse_cutting___tbody").html("");
        else {
            var t = "",
                _ = 0,
                a = "";
            $.each(e.sizes, function(e, a) {
                _++, t += "<tr><td>" + _ + "</td><td>" + (a.size / 1e3).toFixed(2) + "</td><td>" + a.count + "</td></tr>"
            }), $("#roof_specification_table_warehouse_cutting_itog___tbody").html(t), t = "", $.each(e.positions, function(e, _) {
                a = "", $.each(_.cuts, function(e, t) {
                    a += "<span>" + (t / 1e3).toFixed(2) + "</span>"
                }), t += "<tr><td>" + _.n_text + "</td><td>" + (_.size / 1e3).toFixed(2) + "</td><td>" + a + "</td><td>" + (0 == _.waste ? "0" : (_.waste / 1e3).toFixed(2)) + "</td></tr>"
            }), $("#roof_specification_table_warehouse_cutting___tbody").html(t)
        }
    }

    function Fr() {
        if ($("#roof_new_gap_y_ish_text").hide(), 0 < $("#sheet_allowed_length_text_edit_cells").find(".standart").length && 0 < $("#sheet_allowed_length_text_edit_cells").find(".selected").length && 0 == $("#sheet_allowed_length_text_edit_cells").find(".standart.selected").length && "warehouse_whole" == $("#roof_new_mch_edited_shal_calc_mode").find("input[name=\"roof_new_mch_edited_shal_calc_mode\"]:checked").val()) {
            var e = 1e7,
                t = 0;
            $.each($("#sheet_allowed_length_text_edit_cells").find(".selected"), function(_, a) {
                t = parseInt($(a).data("l")), t < e && (e = t)
            });
            var _ = 0;
            if ($.each($("#sheet_allowed_length_text_edit_cells").find(".standart"), function(a, r) {
                    t = parseInt($(r).data("l")), t <= e && (_ = t)
                }), 0 < _) {
                var a = e - _ + parseInt($("#roof_new_gap_y").val());
                $("#roof_new_gap_y_ish_text").html("\u041D\u043E\u0432\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: " + a + " \u043C\u043C"), $("#roof_new_gap_y_ish_text").show()
            }
        }
    }

    function Ar() {
        $("#roof_specification_full_project_table_err_ul").html(""), $("#roof_specification_full_project_err_ul").html(""), $("#roof_specification_full_project_after_checkboxes_err_ul").html(""), $("#roof_specification_full_project_down_err_ul").html(""), $("#roof_specification_full_project_pdf_link").html(""), $("#roof_specification_full_project_pdf_link_png_list_btn").html(""), $("#roof_specification_full_project_pdf_link_png_list_value").html(""), $("#roof_specification_full_project_pdf_link_png_list_value").hide(), $("#roof_specification_full_project_demand_link").html("")
    }

    function qr() {
        ni.pdf_attach_file_name = "", ni.png_attach_files_name = []
    }

    function Tr() {
        ni.sheets_filtered_sorted_grouped = [];
        var e = {},
            t = $("#roof_specification_full_project_form_filters").serializeArray();
        t = Nt(t), t = t.filter, ("undefined" == typeof t || "undefined" == t) && (t = []);
        var _ = [],
            a = {};
        $.each(ni.roof_data_full.cad_elements, function(r, n) {
            -1 !== $.inArray(n.tab_num + "", t) && "undefined" != typeof n.columns_sheets_specification && 0 < n.columns_sheets_specification.length && $.each(n.columns_sheets_specification, function(t, r) {
                a = {
                    size: 100 * Math.round(100 * r.size),
                    amount: Math.round(1e4 * r.amount),
                    quantity: Math.round(1e4 * r.quantity)
                }, "undefined" == typeof e["s" + a.size] && (e["s" + a.size] = {
                    size: a.size,
                    amount: 0,
                    quantity: 0
                }, _.push(a.size)), e["s" + a.size].amount += a.amount, e["s" + a.size].quantity += a.quantity
            })
        }), _ = _.sort(function(e, t) {
            return e - t
        }), $.each(_, function(t, _) {
            $.each(e, function(e, t) {
                t.size == _ && (t.size = (t.size / 1e4).toFixed(2), t.amount = (t.amount / 1e4).toFixed(0), t.quantity = (t.quantity / 1e4).toFixed(2), ni.sheets_filtered_sorted_grouped.push(t))
            })
        });
        var r = "",
            n = 1;
        $.each(ni.sheets_filtered_sorted_grouped, function(e, t) {
            r += "<tr class=\"js_tr_data\"><td>" + n + "</td><td>" + t.size + "</td><td>" + t.amount + "</td><td>" + t.quantity + "</td></tr>", n++
        }), Ar(), SimpleCad.Action({
            type: "roof_specification_full_project_pdf_remove"
        }), qr(), $("#roof_specification_full_project_demand_animation").html(""), $("#roof_specification_full_project_table_tbody").find(".js_tr_data").remove(), $("#roof_specification_full_project_table_tbody").append(r)
    }

    function Sr() {
        var e = vo,
            t = ni.roof_data_full.sheet_tabs.length,
            _ = 0;
        $.each(to, function(e) {
            to[e].hide(), to[e].draw()
        }), $.each(ni.roof_data_full.sheet_tabs, function(a, r) {
            to["layer_" + r.tab_num].show(), to["layer_" + r.tab_num].draw();
            to["layer_" + r.tab_num].toImage({
                callback: function(n) {
                    ni.roof_data_full.sheet_tabs[a].tab_img_src = n.src, ni.roof_data_full.sheet_tabs[a].tab_region = Ee("layer_" + r.tab_num, !0, !0, !0, !0), to["layer_" + r.tab_num].hide(), to["layer_" + r.tab_num].draw(), _++, _ == t && (to[e].show(), to[e].draw())
                }
            })
        })
    }

    function Pr() {
        ni.tabs_filtered = [];
        var e = $("#roof_specification_full_project_form_filters").serializeArray();
        e = Nt(e), e = e.filter, $.each(ni.roof_data_full.sheet_tabs, function(t, _) {
            -1 !== $.inArray(_.tab_num + "", e) && (_.tab_sheets = [], ni.tabs_filtered.push(_))
        }), 0 < ni.tabs_filtered.length && $.each(ni.roof_data_full.cad_elements, function(t, _) {
            -1 !== $.inArray(_.tab_num + "", e) && "undefined" != typeof _.columns_sheets_specification && 0 < _.columns_sheets_specification.length && $.each(ni.tabs_filtered, function(e, t) {
                parseInt(t.tab_num) == parseInt(_.tab_num) && ni.tabs_filtered[e].tab_sheets.push(_.columns_sheets_specification)
            })
        })
    }

    function Ir() {
        var e = $("#roof_specification_full_project_form_filters").serializeArray();
        e = Nt(e), e = e.filter, ("undefined" == typeof e || "undefined" == e) && (e = []);
        var t = {
                slope_length: 0,
                scale_without_cuts: 0,
                scale: 0,
                scale_sheets_full: 0,
                scale_sheets_useful: 0,
                scale_sheets_waste: 0
            },
            _ = $("#roof_specification_table_sheet_tabs_scale_data___tbody tr"),
            a = "",
            r = "",
            n;
        $.each(_, function(_, s) {
            a = $(s)[0].attributes["data-tr-tab-num"].value, -1 === $.inArray(a + "", e) ? $(s).hide() : ($(s).show(), n = $(s).find("td"), $.each(n, function(e, _) {
                r = $(_)[0].attributes["data-td-type"].value, "" != r && (t[r] += parseFloat($(_)[0].innerText))
            }))
        }), $.each(t, function(e, t) {
            "scale_sheets_waste" != e && "slope_length" != e && $("#roof_specification_table_sheet_tabs_scale_data___" + e).html(t.toFixed(2))
        }), t.scale_sheets_waste = 0 == t.scale_sheets_useful ? 0 : 100 - 100 * (t.scale_without_cuts / t.scale_sheets_useful), $("#roof_specification_table_sheet_tabs_scale_data___scale_sheets_waste").html(t.scale_sheets_waste.toFixed(2)), $("#roof_specification_table_sheet_tabs_scale_data___slope_length").html("")
    }

    function Yr(e) {
        var t = "",
            _ = Hi[e.form_id],
            a = "",
            r = "",
            n = "";
        return t += "<form id=\"" + e.form_id + "\">", $.each(_.inputs, function(_, s) {
            a = e[_ + "_val"], r = "undefined" == typeof s.onkeyup ? "" : "onkeyup = \"" + s.onkeyup + "\"", "undefined" != typeof s.is_nosubmit && s.is_nosubmit ? (n = "style=\"display:none;\"", s.label = "", a = 1) : n = "", t += "<div class=\"form-group\" " + n + "><label>" + s.label + "</label><input type=\"text\" class=\"form-control\" name=\"" + _ + "\" id=\"" + _ + "\" value=\"" + a + "\" " + r + "></div>"
        }), t += "<div class=\"row\"><div class=\"col-xs-12\"><ul class=\"gl_form_err_ul\"></ul></div></div></form>", t
    }

    function Dr(e) {
        var t = "",
            _ = Mi[e.footer_id];
        return t += "<div class=\"row\"><div class=\"col-xs-12\">", $.each(_.buttons, function(e, _) {
            if ("undefined" != typeof _.html) t += _.html;
            else if ("undefined" != typeof _.type) switch (_.type) {
                case "close":
                    t += "<button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"btn btn-default\">\u0417\u0430\u043A\u0440\u044B\u0442\u044C <span class=\"btn_enter_text\">(Esc)</span></button>";
                    break;
                default:
            }
        }), t += "</div></div>", t
    }

    function Xr(e) {
        var t = Gr();
        if ("undefined" == typeof t.x_mid) return void SimpleCad.Action({
            type: "ModalShow",
            target: "mirror_tab_btn_click_error"
        });
        var _ = Math.round((t.x_mid - t.x_min) / (Go.g_scale[vo] / 100 / Mo.unit_coefficient));
        $.each(to[vo].children, function(e, a) {
            var r = a.id();
            if ("undefined" != typeof r && -1 < r.indexOf("__")) {
                var n = r.substr(0, r.indexOf("__"));
                switch (n) {
                    case "pline":
                        a.attrs.points = $r(a.attrs.points, t.x_mid), "undefined" != typeof a.attrs.columns_sheets && (a.attrs.columns_sheets = Er(a.attrs.columns_sheets, _));
                        break;
                    default:
                }
            }
        }), "siding" == Mo.type && q_(), resetCADState(), Wr(), refreshCurrentLayer(), e.history && (di = {
            type: "h_mirror_hor_tab",
            need_layer_num: yo,
            need_axis: {
                g_x: Fo[vo],
                g_y: Ao[vo],
                current_layer_name: vo
            }
        }, An({
            mode: "add",
            element: di
        }))
    }

    function Gr() {
        var e = {},
            t = Ct({
                filter_type: ["pline"],
                filter_visible: "1",
                filter_with_columns_sheets: "1",
                limit: 1,
                what: ["pline_points", "pline_roof_calc", "pline_columns_sheets"]
            });
        return 0 == t.length && (t = Ct({
            filter_type: ["pline"],
            filter_visible: "1",
            limit: 1,
            what: ["pline_points", "pline_roof_calc"]
        })), 1 == t.length && "undefined" != typeof t[0].overalls && (e = t[0].overalls), e
    }

    function Wr() {
        SimpleCad.Action({
            type: "roof_params_change",
            param: "direction_toggle_no_roof"
        }), SimpleCad.Action({
            type: "roof_params_change",
            param: "direction_y_toggle_no_roof"
        }), SimpleCad.Action({
            type: "roof_params_change",
            param: "offset_run_type_toggle_no_roof"
        }), SimpleCad.Action({
            type: "roof_params_change",
            param: "offset_x_mirror"
        })
    }

    /**
     * Поворачивает элемент на заданный угол относительно центра его габаритного прямоугольника.
     * 
     * @param {Object} element - Элемент для поворота (Konva.Line).
     * @param {number} angle - Угол поворота в градусах.
     * @param {boolean} addToHistory - Флаг, добавлять ли операцию в историю изменений.
     */
    function rotateElement(element, angle, addToHistory) {        
        // Проверяем, имеет ли элемент идентификатор
        if (typeof element.attrs.id !== "undefined") {
            // Получаем идентификатор и тип элемента
            var elementId = element.attrs.id;
            var elementType = elementId.substr(0, elementId.indexOf("__"));
            
            switch (element.className) {
                case "Line":
                    switch (elementType) {
                        case "pline":
                            // Получаем размеры габаритного прямоугольника для определения центра вращения
                            var elementBounds = G_(element.attrs.points);
                            
                            // Поворачиваем точки полилинии вокруг центра
                            element.attrs.points = Vr(
                                element.attrs.points, 
                                angle, 
                                elementBounds.x_mid, 
                                elementBounds.y_mid
                            );
                            
                            // Обновляем отображение
                            oe();
                            D();
                            refreshCurrentLayer();
                            
                            // Добавляем действие в историю, если требуется
                            if (addToHistory) {
                                di = {
                                    type: "h_rotate_element_pline",
                                    need_layer_num: yo,
                                    need_tab_scale: Go.g_scale[vo],
                                    need_axis: {
                                        g_x: Fo[vo],
                                        g_y: Ao[vo],
                                        current_layer_name: vo
                                    },
                                    element_id: element.attrs.id,
                                    angle: angle
                                };
                                
                                An({
                                    mode: "add",
                                    element: di
                                });
                            }
                            break;
                        
                        default:
                            // Обработка других типов линий
                            break;
                    }
                    break;
                
                default:
                    // Обработка других классов элементов
                    break;
            }
        }
    }

    function Nr(e, t) {
        if ("undefined" != typeof e.attrs.id) {
            var _ = e.attrs.id,
                a = _.substr(0, _.indexOf("__"));
            switch (e.className) {
                case "Line":
                    switch (a) {
                        case "pline":
                            var r = G_(e.attrs.points);
                            if (e.attrs.points = $r(e.attrs.points, r.x_mid), "undefined" != typeof e.attrs.columns_sheets) {
                                var n = Math.round((r.x_mid - r.x_min) / (Go.g_scale[vo] / 100 / Mo.unit_coefficient));
                                e.attrs.columns_sheets = Er(e.attrs.columns_sheets, n), Wr()
                            }
                            oe(), D(), refreshCurrentLayer(), "siding" == Mo.type && q_(), t && (di = {
                                type: "h_mirror_hor_element_pline",
                                need_layer_num: yo,
                                need_tab_scale: Go.g_scale[vo],
                                need_axis: {
                                    g_x: Fo[vo],
                                    g_y: Ao[vo],
                                    current_layer_name: vo
                                },
                                element_id: e.attrs.id
                            }, An({
                                mode: "add",
                                element: di
                            }));
                            break;
                        default:
                    }
                    break;
                default:
            }
        }
    }

    function Vr(e, t, _, a) {
        t = -1 * t * Math.PI / 180;
        for (var r = [], n = Math.cos(t), s = Math.sin(t), o = 1e13, l = 0; l < e.length; l += 2) r.push(Math.round((n * (e[l] - _) + s * (e[l + 1] - a) + _) * o) / o), r.push(Math.round((n * (e[l + 1] - a) - s * (e[l] - _) + a) * o) / o);
        return r
    }

    function $r(e, t) {
        return $.each(e, function(_, a) {
            0 == _ % 2 && (a < t ? e[_] += 2 * (t - a) : a > t && (e[_] -= 2 * (a - t)))
        }), e
    }

    function Er(e, t) {
        return $.each(e, function(_, a) {
            $.each(a, function(a, r) {
                r.left < t ? e[_][a].left += 2 * (t - r.left) : r.left > t && (e[_][a].left -= 2 * (r.left - t)), r.right < t ? e[_][a].right += 2 * (t - r.right) : r.right > t && (e[_][a].right -= 2 * (r.right - t))
            })
        }), e
    }

    /**
     * Отображает подсветку сегмента полилинии и ближайшей точки к курсору.
     *
     * @param {number} mouseX - Координата X курсора.
     * @param {number} mouseY - Координата Y курсора.
     * @param {Array} points - Массив координат точек полилинии в формате [x1, y1, x2, y2, ...].
     * @param {string} parentId - ID родительского элемента (полилинии).
     */
    function highlightPolylineSegment(mouseX, mouseY, points, parentId) {
        // Проверяем, находится ли приложение в режиме "default"
        if (Oo.mode === "default") {
            // Находим ближайший сегмент полилинии к курсору
            var segmentIndex = xa(mouseX, mouseY, points);

            // Получаем координаты точек сегмента
            var segmentPoints = Mt(segmentIndex, points);

            // Обновляем атрибуты подсветки сегмента
            no[vo].attrs.points = segmentPoints;
            no[vo].attrs.parent_id = parentId;

            // Отображаем подсветку сегмента
            no[vo].show();
            no[vo].moveToTop();

            // Обновляем положение ближайшей точки
            updateNearestPoint(mouseX, mouseY, segmentPoints);

            // Отображаем подсветку ближайшей точки
            so[vo].show();
            so[vo].moveToTop();

            // Перерисовываем слой
            to[vo].draw();

            // Устанавливаем флаг, что подсветка активна
            mi = true;
        }
    }


    function Rr(layerX, layerY, points) {
        updateNearestPoint(layerX, layerY, points)
        to[vo].draw()
    }

    /**
     * Обновляет положение ближайшей точки к курсору.
     *
     * @param {number} mouseX - Координата X курсора.
     * @param {number} mouseY - Координата Y курсора.
     * @param {Array} segmentPoints - Координаты точек сегмента [x1, y1, x2, y2].
     */
    function updateNearestPoint(mouseX, mouseY, segmentPoints) {
        // Вычисляем расстояние от курсора до первой и второй точек сегмента
        var distanceToFirstPoint = Math.dist(mouseX, mouseY, segmentPoints[0], segmentPoints[1]);
        var distanceToSecondPoint = Math.dist(mouseX, mouseY, segmentPoints[2], segmentPoints[3]);

        // Устанавливаем координаты подсветки ближайшей точки
        if (distanceToFirstPoint < distanceToSecondPoint) {
            so[vo].x(segmentPoints[0]);
            so[vo].y(segmentPoints[1]);
        } else {
            so[vo].x(segmentPoints[2]);
            so[vo].y(segmentPoints[3]);
        }
    }

    /**
     * Обрабатывает выбор сегмента ломаной линии
     * @param {Object} e - Событие выбора
     * @returns {boolean} - False если событие не должно обрабатываться дальше
     */
    function handleSegmentSelection(e) {
        // Проверяем, является ли это правым кликом в режиме "sznde"
        if (-1 !== $.inArray(ei.type, ["sznde"]) && 2 == e.evt.button) {
            return false;
        }
        
        // Устанавливаем флаг активности и инициализируем объект для хранения данных сегмента
        pi = true;
        hi = {};
        
        // Сохраняем идентификатор родительской линии и сам элемент
        hi.pline_id = e.target.attrs.parent_id;
        hi.parent = Bi.find("#" + hi.pline_id);
        
        // Сохраняем координаты клика
        hi.layerX = e.evt.layerX;
        hi.layerY = e.evt.layerY;
        
        // Обрабатываем правый клик (кнопка 2)
        if (2 == e.evt.button) {
            pi = false;
            ga(hi.parent[0], hi.layerX, hi.layerY);
            hi = {};
            return false;
        }
        
        // Получаем точки ломаной линии и определяем номер сегмента
        hi.pline_points = hi.parent[0].attrs.points;
        hi.segment_num = xa(hi.layerX, hi.layerY, hi.pline_points);
        hi.segment_points = Mt(hi.segment_num, hi.pline_points);
        
        // Вычисляем длину сегмента в зависимости от режима
        if (Oo.mode != 'default' && -1 !== $.inArray(ei.type, ["sznde"])) {
            // Для режима "sznde" используем предварительно вычисленные длины
            var t = hi.parent[0].attrs.pline_lengths_ish;
            var _ = t[hi.segment_num];
            hi.segment_length = _;
        } else {
            // Для других режимов вычисляем длину динамически
            hi.segment_length = Te(
                hi.segment_points[0],
                hi.segment_points[1],
                hi.segment_points[2],
                hi.segment_points[3],
                false
            );
            // Масштабируем и округляем длину сегмента с нужной точностью
            hi.segment_length = U(
                (100 * hi.segment_length / Go.g_scale[vo]).toFixed(yi.length.prec)
            );
        }
        
        // Определяем ближайшую и дальнюю точки сегмента относительно места клика
        var distanceToStart = Math.dist(
            hi.layerX, 
            hi.layerY, 
            hi.segment_points[0], 
            hi.segment_points[1]
        );
        
        var distanceToEnd = Math.dist(
            hi.layerX, 
            hi.layerY, 
            hi.segment_points[2], 
            hi.segment_points[3]
        );
        
        // Сохраняем номера точек в зависимости от расстояния
        if (distanceToStart > distanceToEnd) {
            hi.nearest_point_num_in_pline = hi.segment_num + 1;
            hi.farthest_point_num_in_pline = hi.segment_num;
        } else {
            hi.nearest_point_num_in_pline = hi.segment_num;
            hi.farthest_point_num_in_pline = hi.segment_num + 1;
        }
        
        // Показываем модальное окно для редактирования длины выбранного сегмента
        showModalWindow("pline_segment_highlight_set_length", {});
    }

    function Zr(e, t, _, a) {
        var r = e.attrs.points,
            n = r.length,
            s = [r[2 * t + 0], r[2 * t + 1]],
            o = [r[2 * _ + 0], r[2 * _ + 1]],
            i = calculateAngle(s[0], -1e4, s[0], s[1], o[0], o[1], !0, !0, !1),
            l = Ie(s[0], s[1], a, !0, i);
        di = {
            type: "pline_segment_highlight_set_length_modal",
            need_layer_num: yo,
            need_tab_scale: Go.g_scale[vo],
            need_axis: {
                g_x: Fo[vo],
                g_y: Ao[vo],
                current_layer_name: vo
            },
            pline_data: {
                id: e.attrs.id,
                points: {
                    before: JSON.copy(r)
                }
            }
        };
        var c = !1;
        isPolylineClosed(r) && (c = !0), r[2 * t + 0] += l.delta_x, r[2 * t + 1] += l.delta_y, c && (0 == t && 1 == _ ? (r[n - 2] = r[0], r[n - 1] = r[1]) : t == (n - 2) / 2 && _ == (n - 2) / 2 - 1 && (r[0] = r[n - 2], r[1] = r[n - 1])), e.setAttrs({
            points: r
        }), di.pline_data.points.after = JSON.copy(r), An({
            mode: "add",
            element: di
        })
    }

    function Jr(e, t, _) {
        var a = Bi.findOne("#" + e);
        a.attrs[t + "_val"] = _, 0 == _ && (a.attrs[t] = "empty")
    }

    function Qr(e, t, _) {
        var a = Bi.findOne("#" + e);
        a.attrs[t] = _, "empty" == _ && (a.attrs[t + "_val"] = 0)
    }

    function Ur(e, t) {
        var _ = Bi.findOne("#" + e);
        _.attrs.side_okras = t
    }

    function en(e, t, _) {
        var a = Bi.findOne("#" + e);
        a.attrs[t] = _
    }

    function tn(e, t, _) {
        var a = Bi.findOne("#" + e);
        a.attrs.pline_breaks["l" + t] = _, 0 == _ && (a.attrs.pline_breaks["l" + t] = null, delete a.attrs.pline_breaks["l" + t])
    }

    function _n(e, t) {
        if ("sznde" == ei.type) {
            var _ = Bi.findOne("#" + e),
                a = [],
                r = 0,
                n = 0,
                s = 0,
                o = 0;
            if ("undefined" != typeof t.mode) switch (t.mode) {
                case "lengths_all":
                    _.attrs.pline_lengths_ish = t.lengths;
                    break;
                case "length_one":
                    _.attrs.pline_lengths_ish[t.num] = t.val;
                    break;
                case "create":
                    a = _.points(), r = a.length, _.attrs.pline_lengths_ish = [];
                    for (var l = 0; l < (r - 2) / 2; l++) n = Te(a[2 * s + 0], a[2 * s + 1], a[2 * s + 2], a[2 * s + 3], !1), n = parseFloat((100 * n / Go.g_scale[vo]).toFixed(3)), _.attrs.pline_lengths_ish.push(n), s++;
                    break;
                case "update_considering_pline_breaks":
                    a = _.points(), r = a.length, _.attrs.pline_lengths_ish = [];
                    for (var l = 0; l < (r - 2) / 2; l++) n = Te(a[2 * s + 0], a[2 * s + 1], a[2 * s + 2], a[2 * s + 3], !1), o = 0, "undefined" != typeof _.attrs.pline_breaks["l" + l] && -1 !== $.inArray(parseInt(_.attrs.pline_breaks["l" + l]), Ei) && (o = parseInt(_.attrs.pline_breaks["l" + l])), 0 < o && (n = 100 * (n / o)), n = parseFloat((100 * n / Go.g_scale[vo]).toFixed(3)), _.attrs.pline_lengths_ish.push(n), s++;
                    break;
                default:
            }
        }
    }

    // Изменяет размер отрезка 
    function an(e, t, _, a) {        
        var r = Bi.findOne("#" + e),
            n = 0,
            s = [],
            o = 0,
            l = 0,
            c = 0,
            d = 0;
        if ("undefined" !== r && (s = r.points(), o = s.length, n = Te(s[2 * t + 0], s[2 * t + 1], s[2 * t + 2], s[2 * t + 3], !1), _.toFixed(3) != n.toFixed(3))) {
            if (l = calculateAngle(s[2 * t + 0], -1e4, s[2 * t + 0], s[2 * t + 1], s[2 * t + 2], s[2 * t + 3], !0, !1, !1), d = _ * Go.g_scale[vo] / 100, c = De(s, d, t, l), a)
                for (var p = t; p < o / 2 - 1; p++) s[2 * p + 2] += c.delta_x, s[2 * p + 3] += c.delta_y;
            else
                for (var p = t; 0 <= p; p--) s[2 * p + 0] -= c.delta_x, s[2 * p + 1] -= c.delta_y;
            r.setPoints(s)
        }
    }

    function rn(e, t, _) {
        var a = Bi.findOne("#" + e),
            r = 0,
            n = [],
            s = 0,
            o = {},
            c = {},
            d = 0,
            p = {},
            m = 0,
            h = 0,
            u = {},
            f = 0;
        if ("undefined" !== a && (-0 == _ && (_ = 0), r = t, t++, n = JSON.copy(a.points()), s = n.length, f = calculateAngle(n[2 * (t - 1) + 0], n[2 * (t - 1) + 1], n[2 * (t - 1) + 2], n[2 * (t - 1) + 3], n[2 * (t - 1) + 4], n[2 * (t - 1) + 5], !0, !0, !1), isNaN(f) && (f = 0), _.toFixed(3) != f.toFixed(3))) {
            o["ha_" + t] = _;
            for (var g = t + 1; g < s / 2 - 1; g++) o["ha_" + g] = calculateAngle(n[2 * (g - 1) + 0], n[2 * (g - 1) + 1], n[2 * (g - 1) + 2], n[2 * (g - 1) + 3], n[2 * (g - 1) + 4], n[2 * (g - 1) + 5], !0, !0, !1), isNaN(o["ha_" + g]) && (o["ha_" + g] = 0);
            for (var g = t; g < s / 2 - 1; g++) c["hl_" + g] = Te(n[2 * g + 0], n[2 * g + 1], n[2 * g + 2], n[2 * g + 3], !1);
            for (var g = t; g < s / 2 - 1; g++) d = o["ha_" + g] * l["pi/180"], p = {}, p = We(n[2 * (g - 1) + 0], n[2 * (g - 1) + 1], n[2 * (g - 1) + 2], n[2 * (g - 1) + 3], d), n[2 * g + 2] = parseFloat(p.endPoint_x), n[2 * g + 3] = parseFloat(p.endPoint_y), m = parseFloat(c["hl_" + g]), h = calculateAngle(n[2 * g + 0], -1e4, n[2 * g + 0], n[2 * g + 1], n[2 * g + 2], n[2 * g + 3], !0, !1, !1), isNaN(h) && (h = 0), u = De(n, m, g, h), n[2 * g + 2] += u.delta_x, n[2 * g + 3] += u.delta_y;
            a.setPoints(n)
        }
    }

    function nn(e) {
        return e = e.toFixed(5), e = ut(e), e = parseFloat(e), e
    }

    function sn(e) {
        for (var t = {
                status: "default"
            }, _ = !1, a = !1, r = 0, n; r < e.polygon_compare.points.length; r += 2) n = on(e.polygon_main, e.polygon_compare.points[r], e.polygon_compare.points[r + 1]), n ? a = !0 : _ = !0;
        return t.status = a && !_ ? "all_points_in_polygon" : !a && _ ? "all_points_out_polygon" : "points_in_out_polygon", t
    }

    function on(e, t, _) {
        if (t < e.x_min || t > e.x_max || _ < e.y_min || _ > e.y_max) return !1;
        for (var a = e.points_x, r = e.points_y, n = a.length, s = n - 1, o = 0, l = 0; l < n; l++)(r[l] <= _ && _ < r[s] || r[s] <= _ && _ < r[l]) && t > (a[s] - a[l]) * (_ - r[l]) / (r[s] - r[l]) + a[l] && (o = !o), s = l;
        return 0 != o && !1 != o
    }

    function ln(e) {
        switch (e.mode) {
            case "blur":
            case "select_change":
                cn(e);
                break;
            default:
        }
    }

    function cn(e) {
        $("#roof_accessories_mch_pn_form_link").html("");
        var t = 0,
            _ = 0,
            a = 0,
            r = 0,
            n = "",
            s = 0,
            o = 0,
            i = 0,
            l = "";
        $.each(["inputs", "res"], function(e, c) {
            $.each(Ri[c], function(e, d) {
                if ("inputs" == c || "res" == c && $("#" + e).hasClass("edited") && 1 == $("#" + e).find(".cell_calculated_value_input").length) {
                    switch (c) {
                        case "inputs":
                            l = $("#" + e).val();
                            break;
                        case "res":
                            l = $("#" + e).find(".cell_calculated_value_input").val(), Ri[c][e].is_set = 1;
                            break;
                        default:
                    }
                    switch (d.type) {
                        case "float":
                            t = Math.abs(U(l)), _ = t * Math.pow(10, d.precision), a = Math.round(_), r = a / Math.pow(10, d.precision), n = r.toFixed(d.precision), s = parseFloat(n), Ri[c][e].value = s;
                            break;
                        case "int":
                            t = Math.abs(U(l)), o = Math.round(t), i = parseInt(o), Ri[c][e].value = i;
                            break;
                        case "string":
                            Ri[c][e].value = l;
                            break;
                        default:
                    }
                } else "res" == c && (Ri[c][e].is_set = 0)
            })
        });
        var c = "",
            d = "";
        switch (e.mode) {
            case "blur":
                switch (e.type) {
                    case "roof_accessories_mch_pn_param_changed":
                        d = "inputs";
                        break;
                    case "roof_accessories_mch_pn_param_changed_for_formula":
                        d = "res";
                        break;
                    default:
                }
                switch (Ri[d][e.param].input_type) {
                    case "input":
                        switch (Ri[d][e.param].type) {
                            case "float":
                            case "int":
                                switch (c = Ri[d][e.param].value.toFixed(Ri[d][e.param].precision), d) {
                                    case "inputs":
                                        $("#" + e.param).val(c);
                                        break;
                                    case "res":
                                        $("#" + e.param).find(".cell_calculated_value_input").val(c);
                                        break;
                                    default:
                                }
                                break;
                            default:
                        }
                        break;
                    case "select":
                        break;
                    default:
                }
                break;
            case "select_change":
                break;
            case "modal_loaded_success":
                break;
            case "accessories_cell_calculated_cancel_click":
                break;
            default:
        }
        var p = Ri.inputs.accessories_size_roof_s.value,
            m = Ri.inputs.accessories_size_konek.value,
            h = Ri.inputs.accessories_size_konek_odnoskatn.value,
            u = Ri.inputs.accessories_size_karnizy.value,
            f = Ri.inputs.accessories_size_fronton.value,
            g = Ri.inputs.accessories_size_primyk_verhn.value,
            y = Ri.inputs.accessories_size_endova.value,
            b = Ri.inputs.accessories_size_izlom_vneshn.value,
            v = Ri.inputs.accessories_size_izlom_vnutr.value,
            x = Ri.inputs.accessories_size_uteplenie_tolsh.value,
            w = Ri.inputs.accessories_zaglush_k_polukrugl_konku_torcevaya.value,
            k = Ri.inputs.accessories_zaglush_k_polukrugl_konku_konusnaya.value,
            z = Ri.inputs.accessories_troynik_y_obr_polukrugl_konek.value,
            j = Ri.inputs.accessories_chetvernik_polukrugl_konek.value,
            C = Ri.inputs.accessories_planka_torcevaya_segm_right.value,
            L = Ri.inputs.accessories_planka_torcevaya_segm_left.value,
            O = Ri.inputs.accessories_planka_torcevaya_segm_start_right.value,
            F = Ri.inputs.accessories_planka_torcevaya_segm_start_left.value,
            A = Ri.inputs.accessories_planka_torcevaya_strahovochn.value,
            q = Ri.inputs.accessories_modul_obhoda_truby.value,
            T = Ri.inputs.accessories_sneg_3m.value,
            S = Ri.inputs.accessories_sneg_1m.value,
            P = Ri.inputs.accessories_perehodny_mostik.value,
            I = Ri.inputs.accessories_lestnica_kroveln.value,
            Y = Ri.inputs.accessories_lestnica_stenovaya.value,
            D = Ri.inputs.accessories_ograjd_kroveln_3m.value,
            X = Ri.inputs.accessories_korrektor_carap.value,
            G = Ri.inputs.accessories_lestnica_cherdachn.value,
            W = Ri.inputs.accessories_kojuh_truby.value,
            K = Ri.inputs.accessories_dymnik.value,
            N = Ri.inputs.accessories_oklada_truby.value,
            V = Ri.inputs.accessories_modul_obhoda.value,
            E = Ri.inputs.accessories_kreplenie_vodostoka_dlinnoe_metall_pvh.value,
            M = Ri.inputs.accessories_prohodnoy_element.value,
            R = Ri.inputs.accessories_vent_vyhod_kanaliz.value,
            H = Ri.inputs.accessories_prohodnoy_element_master_flash.value,
            B = Ri.inputs.accessories_stepler_skob_41407.value,
            Z = Ri.inputs.accessories_nasadka_magnit_845_848.value,
            J = Ri.inputs.accessories_nasadka_stal_bober.value,
            Q = 0,
            ee = 0,
            te = 0,
            _e = 0,
            ae = 0;
        0 == Ri.res.res_accessories_konek_polukrugl_197.is_set && (Ri.res.res_accessories_konek_polukrugl_197.value = Math.ceil(m / 1.8)), 0 == Ri.res.res_accessories_konek_figurn.is_set && (Ri.res.res_accessories_konek_figurn.value = Math.ceil(m / 1.9)), 0 == Ri.res.res_accessories_konek_plosk.is_set && (Ri.res.res_accessories_konek_plosk.value = Math.ceil(m / 1.9)), 0 == Ri.res.res_accessories_konek_odnoskat.is_set && (Ri.res.res_accessories_konek_odnoskat.value = Math.ceil(h / 1.9)), 0 == Ri.res.res_accessories_planka_primyk.is_set && (Ri.res.res_accessories_planka_primyk.value = Math.ceil((g + v) / 1.9)), 0 == Ri.res.res_accessories_planka_primyk_vnakl.is_set && (Ri.res.res_accessories_planka_primyk_vnakl.value = Math.ceil(g / 1.9)), 0 == Ri.res.res_accessories_endova_nizn.is_set && (Ri.res.res_accessories_endova_nizn.value = Math.ceil(y / 1.7)), 0 == Ri.res.res_accessories_endova_figurn_verhn.is_set && (Ri.res.res_accessories_endova_figurn_verhn.value = Math.ceil(y / 1.9)), 0 == Ri.res.res_accessories_endova_verhn.is_set && (Ri.res.res_accessories_endova_verhn.value = Math.ceil(y / 1.9)), 0 == Ri.res.res_accessories_planka_karniznaya.is_set && (Ri.res.res_accessories_planka_karniznaya.value = Math.ceil((u + b) / 1.9)), 0 == Ri.res.res_accessories_planka_torcevaya.is_set && (Ri.res.res_accessories_planka_torcevaya.value = Math.ceil(f / 1.9)), 0 == Ri.res.res_accessories_planka_kapelnik.is_set && (Ri.res.res_accessories_planka_kapelnik.value = Math.ceil(u / 1.9)), 0 == Ri.res.res_accessories_samorezy_4219.is_set && (Ri.res.res_accessories_samorezy_4219.value = Math.ceil(3 * (2 * u + b / 2))), 0 == Ri.res.res_accessories_samorezy_4829_krovla.is_set && (Ri.res.res_accessories_samorezy_4829_krovla.value = Math.ceil(6 * (b + v + y + u + g / 2 + f / 2 + h / 2) + Math.ceil(7 * p))), 0 == Ri.res.res_accessories_samorezy_4829_doborn.is_set && (Ri.res.res_accessories_samorezy_4829_doborn.value = Math.ceil(6 * (m + g / 2 + f / 2 + h / 2))), 0 == Ri.res.res_accessories_samorezy_4819.is_set && (Ri.res.res_accessories_samorezy_4819.value = Math.ceil(2.5 * p + 6 * y)), 0 == Ri.res.res_accessories_rezin_uplotnitel.is_set && (0 == T + S ? Ri.res.res_accessories_rezin_uplotnitel.value = 0 : Ri.res.res_accessories_rezin_uplotnitel.value = Math.ceil(4 * T + 4 + 2 * (2 * S))), 0 == Ri.res.res_accessories_uplotnitel_univers_s_kleem_3050.is_set && (Ri.res.res_accessories_uplotnitel_univers_s_kleem_3050.value = Math.ceil(2 * y + g + f)), 1 == Ri.res.res_accessories_uplotnitel_univers_s_kleem_3050.value % 2 && Ri.res.res_accessories_uplotnitel_univers_s_kleem_3050.value++, 0 == Ri.res.res_accessories_uplotnit_lenta_pod_kontrobr.is_set && (Ri.res.res_accessories_uplotnit_lenta_pod_kontrobr.value = Math.ceil(2 * (p / 30))), 0 == Ri.res.res_accessories_lenta_germetiz_stykov.is_set && (Ri.res.res_accessories_lenta_germetiz_stykov.value = Math.ceil(p / 20)), 0 == Ri.res.res_accessories_aeroelement_konka_gl_5m.is_set && (Ri.res.res_accessories_aeroelement_konka_gl_5m.value = Math.ceil((m + h) / 4.9)), 0 == Ri.res.res_accessories_lenta_ventil_gl_1005000.is_set && (Ri.res.res_accessories_lenta_ventil_gl_1005000.value = Math.ceil(u / 4.95)), 0 == Ri.res.res_accessories_membrana_superdiff.is_set && (Ri.res.res_accessories_membrana_superdiff.value = Math.ceil(p / 65)), Q = Ri.res.res_accessories_membrana_superdiff.value, 0 == Ri.res.res_accessories_plenka_paroizol.is_set && (Ri.res.res_accessories_plenka_paroizol.value = Math.ceil(p / 60)), ee = Ri.res.res_accessories_plenka_paroizol.value, 0 == Ri.res.res_accessories_uteplitel.is_set && (Ri.res.res_accessories_uteplitel.value = (p - .15 * p) * x / 1e3, Ri.res.res_accessories_uteplitel.value *= 100, Ri.res.res_accessories_uteplitel.value = Math.round(Ri.res.res_accessories_uteplitel.value), Ri.res.res_accessories_uteplitel.value /= 100, Ri.res.res_accessories_uteplitel.value = Ri.res.res_accessories_uteplitel.value.toFixed(2), Ri.res.res_accessories_uteplitel.value = parseFloat(Ri.res.res_accessories_uteplitel.value)), 0 == Ri.res.res_accessories_brus_profil.is_set && (Ri.res.res_accessories_brus_profil.value = Math.ceil(.55 * p)), 0 == Ri.res.res_accessories_odnostor_dvustor_soedinit_lenta.is_set && (Ri.res.res_accessories_odnostor_dvustor_soedinit_lenta.value = Math.ceil(Math.round(50 * (Q + ee) / 24.95))), 0 == Ri.res.res_accessories_kroveln_ventil.is_set && (Ri.res.res_accessories_kroveln_ventil.value = Math.ceil(p / 50)), ae = Ri.res.res_accessories_kroveln_ventil.value, 0 == Ri.res.res_accessories_germetik.is_set && (Ri.res.res_accessories_germetik.value = Math.ceil(g / 6 + y / 20 + (ae + M) / 4)), te = Ri.res.res_accessories_germetik.value, 0 == Ri.res.res_accessories_lenta_primyk_gofr_alum_gl.is_set && (Ri.res.res_accessories_lenta_primyk_gofr_alum_gl.value = Math.ceil(g / 4.9)), _e = Ri.res.res_accessories_lenta_primyk_gofr_alum_gl.value, 0 == Ri.res.res_accessories_rolik_prikatochn.is_set && (0 < _e ? Ri.res.res_accessories_rolik_prikatochn.value = 1 : Ri.res.res_accessories_rolik_prikatochn.value = 0), 0 == Ri.res.res_accessories_samorezy_pz_ocink_uvelich_stoykost.is_set && (Ri.res.res_accessories_samorezy_pz_ocink_uvelich_stoykost.value = Math.ceil(3 * E)), 0 == Ri.res.res_accessories_pistolet_germetik.is_set && (0 < te ? Ri.res.res_accessories_pistolet_germetik.value = 1 : Ri.res.res_accessories_pistolet_germetik.value = 0), 0 == Ri.res.res_accessories_skoby_stepler.is_set && (Ri.res.res_accessories_skoby_stepler.value = Math.ceil(2 * (1.1 * p) / 150)), $.each(Ri.res, function(e, t) {
            switch (t.type) {
                case "int":
                case "float":
                    c = t.value.toFixed(t.precision), 0 == t.is_set ? $("#" + e).find(".cell_calculated_value_span").html(c) : $("#" + e).find(".cell_calculated_value_input").val(c);
                    break;
                default:
            }
        })
    }

    function dn(e) {
        switch (e.btn_mode) {
            case "yes":
                switch (e.calc_mode) {
                    case "roof_accessories_mch_pn":
                        Bo = "", $("#modal_second_modal").hide(), $("#modal_html").modal("hide");
                        break;
                    default:
                }
                break;
            case "no":
                switch (e.calc_mode) {
                    case "roof_accessories_mch_pn":
                        $("#modal_second_modal").hide();
                        break;
                    default:
                }
                break;
            default:
        }
    }

    function pn(e) {
        switch (e.calc_mode) {
            case "roof_accessories_mch_pn":
                mn();
                break;
            default:
        }
    }

    function mn() {
        $("#roof_accessories_mch_pn_form_animation").html(Jo), $("#roof_accessories_mch_pn_form_link").html(""), K("roof_accessories_mch_pn_save_as_pdf", {
            accessories: Ri
        })
    }

    function hn(e) {
        var t = e.thisObject.parent().parent(),
            _ = t[0].attributes.id.value,
            a = t.find(".cell_calculated_value_span").html(),
            r = "";
        switch (e.calc_mode) {
            case "roof_accessories_mch_pn":
                r = "roof_accessories_mch_pn_param_changed_for_formula";
                break;
            default:
        }
        var n = "<input class=\"form-control table_cad_cell_inputed text-center cell_calculated_value_input\" type=\"text\" value=\"" + a + "\" onblur=\"SimpleCad.Action({'type':'" + r + "', 'mode':'blur', 'param':'" + _ + "' });\">";
        t.addClass("edited"), t.find(".cell_calculated_value_span").replaceWith(n)
    }

    function un(e) {
        var t = e.thisObject.parent().parent();
        t.removeClass("edited"), t.find(".cell_calculated_value_input").replaceWith("<span class=\"cell_calculated_value_span\">0</span>"), cn({
            mode: "accessories_cell_calculated_cancel_click"
        })
    }

    function fn(e, t, _) {
        if (!_) {
            var a = {
                    columns_sheets: [],
                    id: "",
                    overalls: {},
                    start_point: {}
                },
                r = Ct({
                    filter_type: ["pline"],
                    filter_visible: "1",
                    filter_with_columns_sheets: "1"
                });
            if (1 == r.length) {
                var n = G_(r[0].points);
                a = {
                    columns_sheets: r[0].columns_sheets,
                    id: r[0].id,
                    overalls: n,
                    start_point: {
                        left: n.x_min,
                        bottom: n.y_max
                    }
                }, ii = Bi.findOne("#" + a.id)
            }
            Xo = {
                is_active: !0,
                x_start: e,
                y_start: t,
                slope: {
                    columns_sheets: a.columns_sheets,
                    id: a.id,
                    overalls: a.overalls,
                    start_point: a.start_point
                }
            }, oi = {}, H_({
                is_layers_redraw: !0
            })
        }
    }

    function gn() {
        Xo = {
            is_active: !1,
            x_start: 0,
            y_start: 0,
            slope: {
                columns_sheets: [],
                id: "",
                overalls: {},
                start_point: {}
            }
        }, fo[vo].hide(), to[vo].batchDraw(), R_()
    }

    function yn(e, t) {
        fo[vo].setAttrs({
            visible: !0,
            x: Xo.x_start,
            y: Xo.y_start,
            width: e - Xo.x_start,
            height: t - Xo.y_start
        }), 0 < Xo.slope.columns_sheets.length && (oi = bn(e, t), H_({
            is_layers_redraw: !1
        })), to[vo].batchDraw()
    }

    function bn(e, t) {
        var _ = {},
            a = 0,
            r = 0,
            n = 0,
            s = 0;
        t < Xo.y_start ? (a = t, r = Xo.y_start) : (a = Xo.y_start, r = t), e > Xo.x_start ? (s = e, n = Xo.x_start) : (s = Xo.x_start, n = e);
        var o = {
                top: 1e3 * (100 * ((Xo.slope.start_point.bottom - a) / Go.g_scale[vo])),
                bottom: 1e3 * (100 * ((Xo.slope.start_point.bottom - r) / Go.g_scale[vo])),
                left: 1e3 * (100 * ((n - Xo.slope.start_point.left) / Go.g_scale[vo])),
                right: 1e3 * (100 * ((s - Xo.slope.start_point.left) / Go.g_scale[vo]))
            },
            i = !1,
            l = "";
        return $.each(Xo.slope.columns_sheets, function(e, t) {
            $.each(t, function(t, a) {
                i = vn(o, a), i && (l = Xo.slope.id + "_col_" + e + "_sh_" + t, _[l] = {})
            })
        }), _
    }

    function vn(e, t) {
        var _ = !1;
        return e.left > t.right || e.right < t.left || e.top < t.bottom || e.bottom > t.top || (_ = !0), _
    }

    function xn(e) {
        var t = e[0].attributes.id.value,
            _ = e[0].value + "",
            a = 0,
            r = "";
        if (a = Math.abs(U(_)), "undefined" != typeof e[0].attributes["data-max-val-int"]) {
            var n = parseInt(e[0].attributes["data-max-val-int"].value);
            a > n && (a = n)
        }
        r = a.toFixed(3), "0.000" == r ? $("#" + t).val("") : $("#" + t).val(ut(r))
    }

    function wn(e, t) {
        var _ = "trigonom_" + t + "_form",
            a = _.replace("form", "");
        fi = Vt(_, a), ai = JSON.parse(JSON.stringify(ri)), Xt(_), kn(_, e, a), 0 == ai.errors.length || Qt(_, ai)
    }

    function kn(e, t, _) {
        var a = t.replace(_, ""),
            r = 0,
            n = "",
            s = "",
            o = "",
            i = {};
        switch (e) {
            case "trigonom_triangle_form":
                switch (fi.s = 0, fi.p = 0, fi.h = 0, fi.a1 = 0, gi = {
                        "a>0": !!(0 < fi.a),
                        "b>0": !!(0 < fi.b),
                        "c>0": !!(0 < fi.c),
                        "al>0": !!(0 < fi.al),
                        "be>0": !!(0 < fi.be),
                        "ga>0": !!(0 < fi.ga),
                        a_dis: !!$("#" + _ + "a").prop("disabled"),
                        b_dis: !!$("#" + _ + "b").prop("disabled"),
                        c_dis: !!$("#" + _ + "c").prop("disabled"),
                        al_dis: !!$("#" + _ + "al").prop("disabled"),
                        be_dis: !!$("#" + _ + "be").prop("disabled"),
                        ga_dis: !!$("#" + _ + "ga").prop("disabled"),
                        trig_che: !!$("#trigonom_triangle_rectangular").prop("checked")
                    }, gi._a = gi["a>0"] && !gi.a_dis, gi._b = gi["b>0"] && !gi.b_dis, gi._c = gi["c>0"] && !gi.c_dis, gi._abc = !!(gi._a && gi._b && gi._c), gi._or_abc = !!(gi._a || gi._b || gi._c), gi._or_2_l = !!(gi._a && gi._b || gi._a && gi._c || gi._b && gi._c), gi._al = gi["al>0"] && !gi.al_dis, gi._be = gi["be>0"] && !gi.be_dis, gi._ga = !!(gi["ga>0"] && (!gi.ga_dis || gi.ga_dis && gi.trig_che)), gi._or_albega = !!(gi._al || gi._be || gi._ga), gi._or_2_angle = !!(gi._al && gi._be || gi._al && gi._ga || gi._be && gi._ga), t) {
                    case "trigonom_triangle_a":
                        gi._abc ? r = 1 : gi._a && (gi._b || gi._c) && gi._or_albega ? r = 2 : gi._a && gi._or_2_angle && (r = 3);
                        break;
                    case "trigonom_triangle_b":
                        gi._abc ? r = 1 : gi._b && (gi._a || gi._c) && gi._or_albega ? r = 2 : gi._b && gi._or_2_angle && (r = 3);
                        break;
                    case "trigonom_triangle_c":
                        gi._abc ? r = 1 : gi._c && (gi._a || gi._b) && gi._or_albega ? r = 2 : gi._c && gi._or_2_angle && (r = 3);
                        break;
                    case "trigonom_triangle_al":
                        gi._al && gi._or_2_l ? r = 2 : gi._al && (gi._be || gi._ga) && gi._or_abc && (r = 3);
                        break;
                    case "trigonom_triangle_be":
                        gi._be && gi._or_2_l ? r = 2 : gi._be && (gi._al || gi._ga) && gi._or_abc && (r = 3);
                        break;
                    case "trigonom_triangle_ga":
                        gi._ga && gi._or_2_l ? r = 2 : gi._ga && (gi._al || gi._be) && gi._or_abc && (r = 3);
                        break;
                    default:
                }
                switch (r) {
                    case 1:
                        zn("angles_end_graph_val_disabled", _), fi.a + fi.b > fi.c && fi.a + fi.c > fi.b && fi.b + fi.c > fi.a ? (zn("all_other_params_by_abc", _), zn("angles_end_graph_val", _), zn("stat_end_graph_html", _)) : (ai.errors.push("\u0421\u0442\u043E\u0440\u043E\u043D\u0430 \u0442\u0440\u0435\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u0430 \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u0430 \u0441\u0443\u043C\u043C\u044B \u0434\u0432\u0443\u0445 \u0434\u0440\u0443\u0433\u0438\u0445 \u0441\u0442\u043E\u0440\u043E\u043D (#1)."), zn("angles_end_graph_val_empty", _), zn("stat_end_graph_html_empty", _));
                        break;
                    case 2:
                        switch (gi._a && gi._b && (n = "a_b"), gi._a && gi._c && (n = "a_c"), gi._b && gi._c && (n = "b_c"), gi._al ? s = "al" : gi._be ? s = "be" : gi._ga && (s = "ga"), n) {
                            case "a_b":
                                $("#" + _ + "c").prop("disabled", !0);
                                break;
                            case "a_c":
                                $("#" + _ + "b").prop("disabled", !0);
                                break;
                            case "b_c":
                                $("#" + _ + "a").prop("disabled", !0);
                                break;
                            default:
                        }
                        switch (s) {
                            case "al":
                                $("#" + _ + "be").prop("disabled", !0), $("#" + _ + "ga").prop("disabled", !0);
                                break;
                            case "be":
                                $("#" + _ + "al").prop("disabled", !0), $("#" + _ + "ga").prop("disabled", !0);
                                break;
                            case "ga":
                                $("#" + _ + "al").prop("disabled", !0), $("#" + _ + "be").prop("disabled", !0);
                                break;
                            default:
                        }
                        switch (o = n + "_" + s, o) {
                            case "a_b_al":
                            case "a_b_be":
                            case "a_c_al":
                            case "a_c_ga":
                            case "b_c_be":
                            case "b_c_ga":
                                i = {
                                    type: "2_length_1_angle",
                                    mode: o
                                }, jn(i, _);
                                break;
                            case "a_b_ga":
                            case "a_c_be":
                            case "b_c_al":
                                i = {
                                    type: "2_length_1_angle_between",
                                    mode: o
                                }, jn(i, _);
                                break;
                            default:
                        }
                        break;
                    case 3:
                        switch (gi._al && gi._be ? s = "al_be" : gi._al && gi._ga ? s = "al_ga" : gi._be && gi._ga && (s = "be_ga"), gi._a ? n = "a" : gi._b ? n = "b" : gi._c && (n = "c"), s) {
                            case "al_be":
                                $("#" + _ + "ga").prop("disabled", !0), fi.ga = 180 - fi.al - fi.be;
                                break;
                            case "al_ga":
                                $("#" + _ + "be").prop("disabled", !0), fi.be = 180 - fi.al - fi.ga;
                                break;
                            case "be_ga":
                                $("#" + _ + "al").prop("disabled", !0), fi.al = 180 - fi.be - fi.ga;
                                break;
                            default:
                        }
                        switch (n) {
                            case "a":
                                $("#" + _ + "b").prop("disabled", !0), $("#" + _ + "c").prop("disabled", !0);
                                break;
                            case "b":
                                $("#" + _ + "a").prop("disabled", !0), $("#" + _ + "c").prop("disabled", !0);
                                break;
                            case "c":
                                $("#" + _ + "a").prop("disabled", !0), $("#" + _ + "b").prop("disabled", !0);
                                break;
                            default:
                        }
                        o = n + "_" + s, i = {
                            type: "1_length_2_angle",
                            mode: o
                        }, jn(i, _);
                        break;
                    default:
                }
                break;
            default:
        }
    }

    function zn(e, t) {
        switch (e) {
            case "all_other_params_by_abc":
                fi.p = fi.a + fi.b + fi.c, fi.p_2 = fi.p / 2, fi.s = Math.sqrt(fi.p_2 * (fi.p_2 - fi.a) * (fi.p_2 - fi.b) * (fi.p_2 - fi.c)), fi.h = 2 * fi.s / fi.a, fi.a1 = Math.sqrt(fi.b * fi.b - fi.h * fi.h), fi.cos_al = (fi.b * fi.b + fi.c * fi.c - fi.a * fi.a) / (2 * fi.b * fi.c), fi.cos_be = (fi.a * fi.a + fi.c * fi.c - fi.b * fi.b) / (2 * fi.a * fi.c), fi.al = parseFloat((Math.round(1e3 * (Math.acos(fi.cos_al) * l["180/pi"])) / 1e3).toFixed(3)), fi.be = parseFloat((Math.round(1e3 * (Math.acos(fi.cos_be) * l["180/pi"])) / 1e3).toFixed(3)), fi.ga = parseFloat((180 - fi.al - fi.be).toFixed(3)), SimpleCad.Action({
                    type: "trigonom_triangle_rectangular_chb_disable"
                });
                break;
            case "angles_end_graph_val":
                $("#" + t + "al").val(ut(fi.al.toFixed(3))), $("#" + t + "be").val(ut(fi.be.toFixed(3))), $("#" + t + "ga").val(ut(fi.ga.toFixed(3)));
                break;
            case "angles_end_graph_val_empty":
                $("#" + t + "al").val(""), $("#" + t + "be").val(""), $("#" + t + "ga").val("");
                break;
            case "angles_end_graph_val_disabled":
                $("#" + t + "al").prop("disabled", !0), $("#" + t + "be").prop("disabled", !0), $("#" + t + "ga").prop("disabled", !0);
                break;
            case "stat_end_graph_html":
                $("#" + t + "s").html(ut(fi.s.toFixed(3))), $("#" + t + "p").html(ut(fi.p.toFixed(3)));
                break;
            case "stat_end_graph_html_empty":
                $("#" + t + "s").html("0.00"), $("#" + t + "p").html("0.00");
                break;
            default:
        }
    }

    function jn(e, t) {
        var _ = {};
        switch (e.mode) {
            case "a_b_al":
                _ = {
                    "1_l": "a",
                    "2_l": "b",
                    "3_l": "c",
                    "1_angle": "al",
                    "2_angle": "be",
                    "3_angle": "ga",
                    by: "a,b,\u03B1"
                };
                break;
            case "a_b_be":
                _ = {
                    "1_l": "b",
                    "2_l": "a",
                    "3_l": "c",
                    "1_angle": "be",
                    "2_angle": "al",
                    "3_angle": "ga",
                    by: "a,b,\u03B2"
                };
                break;
            case "a_c_al":
                _ = {
                    "1_l": "a",
                    "2_l": "c",
                    "3_l": "b",
                    "1_angle": "al",
                    "2_angle": "ga",
                    "3_angle": "be",
                    by: "a,c,\u03B1"
                };
                break;
            case "a_c_ga":
                _ = {
                    "1_l": "c",
                    "2_l": "a",
                    "3_l": "b",
                    "1_angle": "ga",
                    "2_angle": "al",
                    "3_angle": "be",
                    by: "a,c,\u03B3"
                };
                break;
            case "b_c_be":
                _ = {
                    "1_l": "b",
                    "2_l": "c",
                    "3_l": "a",
                    "1_angle": "be",
                    "2_angle": "ga",
                    "3_angle": "al",
                    by: "b,c,\u03B2"
                };
                break;
            case "b_c_ga":
                _ = {
                    "1_l": "c",
                    "2_l": "b",
                    "3_l": "a",
                    "1_angle": "ga",
                    "2_angle": "be",
                    "3_angle": "al",
                    by: "b,c,\u03B3"
                };
                break;
            case "a_b_ga":
                _ = {
                    "1_l": "a",
                    "2_l": "b",
                    "3_l": "c",
                    "1_angle": "ga",
                    "2_angle": "al",
                    "3_angle": "be",
                    by: "a,b,\u03B3"
                };
                break;
            case "a_c_be":
                _ = {
                    "1_l": "a",
                    "2_l": "c",
                    "3_l": "b",
                    "1_angle": "be",
                    "2_angle": "al",
                    "3_angle": "ga",
                    by: "a,c,\u03B2"
                };
                break;
            case "b_c_al":
                _ = {
                    "1_l": "b",
                    "2_l": "c",
                    "3_l": "a",
                    "1_angle": "al",
                    "2_angle": "be",
                    "3_angle": "ga",
                    by: "b,c,\u03B1"
                };
                break;
            case "a_al_be":
                _ = {
                    "1_l": "a",
                    "2_l": "b",
                    "3_l": "c",
                    "1_angle": "al",
                    "2_angle": "be",
                    "3_angle": "ga",
                    "3_angle_gr": "ga",
                    by: "a,\u03B1,\u03B2"
                };
                break;
            case "a_al_ga":
                _ = {
                    "1_l": "a",
                    "2_l": "c",
                    "3_l": "b",
                    "1_angle": "al",
                    "2_angle": "ga",
                    "3_angle": "be",
                    "3_angle_gr": "be",
                    by: "a,\u03B1,\u03B3"
                };
                break;
            case "a_be_ga":
                _ = {
                    "1_l": "a",
                    "2_l": "b",
                    "3_l": "c",
                    "1_angle": "al",
                    "2_angle": "be",
                    "3_angle": "ga",
                    "3_angle_gr": "al",
                    by: "a,\u03B2,\u03B3"
                };
                break;
            case "b_al_be":
                _ = {
                    "1_l": "b",
                    "2_l": "a",
                    "3_l": "c",
                    "1_angle": "be",
                    "2_angle": "al",
                    "3_angle": "ga",
                    "3_angle_gr": "ga",
                    by: "b,\u03B1,\u03B2"
                };
                break;
            case "b_al_ga":
                _ = {
                    "1_l": "b",
                    "2_l": "a",
                    "3_l": "c",
                    "1_angle": "be",
                    "2_angle": "al",
                    "3_angle": "ga",
                    "3_angle_gr": "be",
                    by: "b,\u03B1,\u03B3"
                };
                break;
            case "b_be_ga":
                _ = {
                    "1_l": "b",
                    "2_l": "c",
                    "3_l": "a",
                    "1_angle": "be",
                    "2_angle": "ga",
                    "3_angle": "al",
                    "3_angle_gr": "al",
                    by: "b,\u03B2,\u03B3"
                };
                break;
            case "c_al_be":
                _ = {
                    "1_l": "c",
                    "2_l": "a",
                    "3_l": "b",
                    "1_angle": "ga",
                    "2_angle": "al",
                    "3_angle": "be",
                    "3_angle_gr": "ga",
                    by: "c,\u03B1,\u03B2"
                };
                break;
            case "c_al_ga":
                _ = {
                    "1_l": "c",
                    "2_l": "a",
                    "3_l": "b",
                    "1_angle": "ga",
                    "2_angle": "al",
                    "3_angle": "be",
                    "3_angle_gr": "be",
                    by: "c,\u03B1,\u03B3"
                };
                break;
            case "c_be_ga":
                _ = {
                    "1_l": "c",
                    "2_l": "b",
                    "3_l": "a",
                    "1_angle": "ga",
                    "2_angle": "be",
                    "3_angle": "al",
                    "3_angle_gr": "al",
                    by: "c,\u03B2,\u03B3"
                };
                break;
            default:
        }
        switch (e.type) {
            case "2_length_1_angle":
                fi["sin_" + _["2_angle"]] = fi[_["2_l"]] * Math.sin(fi[_["1_angle"]] * l["pi/180"]) / fi[_["1_l"]], -1 <= fi["sin_" + _["2_angle"]] && 1 >= fi["sin_" + _["2_angle"]] ? (fi[_["2_angle"]] = Math.asin(fi["sin_" + _["2_angle"]]) * l["180/pi"], fi[_["3_angle"]] = 180 - fi[_["1_angle"]] - fi[_["2_angle"]], 0 < fi[_["3_angle"]] ? (fi[_["3_l"]] = fi[_["2_l"]] * Math.sin(fi[_["3_angle"]] * l["pi/180"]) / Math.sin(fi[_["2_angle"]] * l["pi/180"]), fi.a + fi.b > fi.c && fi.a + fi.c > fi.b && fi.b + fi.c > fi.a ? (zn("all_other_params_by_abc", t), $("#" + t + _["3_l"]).val(ut(fi[_["3_l"]].toFixed(3))), $("#" + t + _["2_angle"]).val(ut(fi[_["2_angle"]].toFixed(3))), $("#" + t + _["3_angle"]).val(ut(fi[_["3_angle"]].toFixed(3))), zn("stat_end_graph_html", t)) : ai.errors.push("\u041F\u043E \u0437\u0430\u0434\u0430\u043D\u043D\u044B\u043C \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0430\u043C " + _.by + " \u043D\u0435\u043B\u044C\u0437\u044F \u043F\u043E\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u0442\u0440\u0435\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A (#2_1).")) : ai.errors.push("\u041F\u043E \u0437\u0430\u0434\u0430\u043D\u043D\u044B\u043C \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0430\u043C " + _.by + " \u043D\u0435\u043B\u044C\u0437\u044F \u043F\u043E\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u0442\u0440\u0435\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A (#2_2).")) : ai.errors.push("\u041F\u043E \u0437\u0430\u0434\u0430\u043D\u043D\u044B\u043C \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0430\u043C " + _.by + " \u043D\u0435\u043B\u044C\u0437\u044F \u043F\u043E\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u0442\u0440\u0435\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A (#2_3)."), 0 < ai.errors.length && ($("#" + t + _["3_l"]).val(""), $("#" + t + _["2_angle"]).val(""), $("#" + t + _["3_angle"]).val(""), zn("stat_end_graph_html_empty", t));
                break;
            case "2_length_1_angle_between":
                fi[_["3_l"]] = Math.sqrt(fi[_["1_l"]] * fi[_["1_l"]] + fi[_["2_l"]] * fi[_["2_l"]] - 2 * fi[_["1_l"]] * fi[_["2_l"]] * Math.cos(fi[_["1_angle"]] * l["pi/180"])), zn("all_other_params_by_abc", t), $("#" + t + _["3_l"]).val(ut(fi[_["3_l"]].toFixed(3))), $("#" + t + _["2_angle"]).val(ut(fi[_["2_angle"]].toFixed(3))), $("#" + t + _["3_angle"]).val(ut(fi[_["3_angle"]].toFixed(3))), zn("stat_end_graph_html", t);
                break;
            case "1_length_2_angle":
                0 < fi.al && 0 < fi.be && 0 < fi.ga ? (fi[_["2_l"]] = fi[_["1_l"]] * Math.sin(fi[_["2_angle"]] * l["pi/180"]) / Math.sin(fi[_["1_angle"]] * l["pi/180"]), fi[_["3_l"]] = fi[_["2_l"]] * Math.sin(fi[_["3_angle"]] * l["pi/180"]) / Math.sin(fi[_["2_angle"]] * l["pi/180"]), zn("all_other_params_by_abc", t), $("#" + t + _["2_l"]).val(ut(fi[_["2_l"]].toFixed(3))), $("#" + t + _["3_l"]).val(ut(fi[_["3_l"]].toFixed(3))), $("#" + t + _["3_angle_gr"]).val(ut(fi[_["3_angle_gr"]].toFixed(3))), zn("stat_end_graph_html", t)) : ai.errors.push("\u0421\u0443\u043C\u043C\u0430 \u0432\u0441\u0435\u0445 \u0443\u0433\u043B\u043E\u0432 \u0434\u043E\u043B\u0436\u043D\u0430 \u0440\u0430\u0432\u043D\u044F\u0442\u044C\u0441\u044F 180 (#3_1).");
                break;
            default:
        }
    }

    function Cn() {
        var e = "",
            t = 0,
            _ = !1,
            a = ["proc", "otn", "ukl", "kukl"],
            r = "";
        $.each(["al", "be", "ga"], function(n, s) {
            e = $("#trigonom_triangle_" + s).val(), t = Math.abs(U(e)), 90 < t && (t = 180 - t), _ = !!$("#trigonom_triangle_" + s).prop("disabled"), $.each(a, function(e, a) {
                if (90 == t) r = "-";
                else if (0 < t) switch (a) {
                    case "proc":
                        r = Ut(t);
                        break;
                    case "otn":
                        r = t_(t);
                        break;
                    case "ukl":
                        r = a_(t);
                        break;
                    case "kukl":
                        r = n_(t);
                        break;
                    default:
                } else r = "";
                $("#trigonom_triangle_" + s + "_" + a).prop("disabled", _), $("#trigonom_triangle_" + s + "_" + a).val(r)
            })
        })
    }

    function Ln() {
        for (var e = "", t = "", _ = 2; 45 >= _; _++) t = "onclick=\"SimpleCad.Action({'type':'trigonom_figure_table_modal_row_click', 'angle' : '" + _ + "'});\"", e += "<tr " + t + "><td>" + _ + "</td><td>" + Ut(_) + "</td><td>1:" + t_(_) + "</td><td>" + a_(_) + "</td><td>" + n_(_) + "</td></tr>";
        $("#trigonom_other_table_left").html(e), e = "";
        for (var _ = 46; 89 >= _; _++) t = "onclick=\"SimpleCad.Action({'type':'trigonom_figure_table_modal_row_click', 'angle' : '" + _ + "'});\"", e += "<tr " + t + "><td>" + _ + "</td><td>" + Ut(_) + "</td><td>1:" + t_(_) + "</td><td>" + a_(_) + "</td><td>" + n_(_) + "</td></tr>";
        $("#trigonom_other_table_right").html(e)
    }

    function On(e) {
        for (var t = new Date().getTime(), _ = 0; 1e7 > _ && !(new Date().getTime() - t > e); _++);
    }

    function Fn(e, t, _, a, r) {
        var n = {
            roof_menu_edit_sheet_paste: {
                cad_elements: {
                    is_set_id: !1,
                    is_set_name: !1
                },
                is_history: !0
            },
            h_sheet_remove: {
                cad_elements: {
                    is_set_id: !0,
                    is_set_name: !0
                },
                is_history: !1
            }
        } [a];
        configureLayerSettings({
            type: "",
            set_current_layer_num: _,
            set_tab_text: e.tab_name,
            history: n.is_history,
            axis_point_tab_set: r
        }), Go.g_scale[vo] = e.tab_scale, Ca(), Mo.sheet_max_length[vo] = parseInt(e.tab_sheet_max_length), Mo.offset_x[vo] = parseInt(e.tab_offset_x), Mo.offset_y[vo] = parseInt(e.tab_offset_y), Mo.cornice[vo] = parseInt(e.tab_cornice), Mo.direction[vo] = e.tab_direction, Mo.direction_y[vo] = e.tab_direction_y, Mo.offset_run_type[vo] = e.tab_offset_run_type, Mo.sheet_length_text_mode[vo] = e.tab_sheet_length_text_mode, ca(), drawGrid(), 0 < t.length && ($.each(t, function(e, t) {
            var _ = "";
            n.cad_elements.is_set_id && (_ = t.id);
            var a = "";
            n.cad_elements.is_set_name && (a = t.name);
            var r = createPolyline({
                points: t.points,
                columns_sheets: t.columns_sheets,
                offset_origin: t.offset_origin,
                is_offset_origin_add: !1,
                id: _,
                name: a
            });
            to[vo].add(r), I({
                "data-element": "pline",
                id: r.id()
            }), processElementAndAddMovePoints(r, !1)
        }), processLayerElements({
            CheckIsVisible: !1
        }), gt({
            CheckIsVisible: !1
        }), W_({
            CheckIsVisible: !1
        }), to[vo].draw(), se(), ie(), oe(), da()), rl.find("[data-layer-num=\"" + _ + "\"]").trigger("click")
    }

    function An(e) {
        switch (e.mode) {
            case "add":
                li.splice(ci + 1), li.push(JSON.copy(e.element)), ci = li.length - 1, An({
                    mode: "graph"
                }), An({
                    mode: "memory_limit"
                });
                break;
            case "graph":
                0 == li.length ? (xl.removeClass("d_nav_4_right_i_active"), wl.removeClass("d_nav_4_right_i_active")) : ci == li.length - 1 ? (xl.addClass("d_nav_4_right_i_active"), wl.removeClass("d_nav_4_right_i_active")) : -1 == ci ? (xl.removeClass("d_nav_4_right_i_active"), wl.addClass("d_nav_4_right_i_active")) : (xl.addClass("d_nav_4_right_i_active"), wl.addClass("d_nav_4_right_i_active"));
                break;
            case "prev":
                xl.hasClass("d_nav_4_right_i_active") && (An({
                    mode: "set_from_history",
                    set_mode: "before"
                }), ci -= 1, An({
                    mode: "graph"
                }));
                break;
            case "next":
                wl.hasClass("d_nav_4_right_i_active") && (ci += 1, An({
                    mode: "set_from_history",
                    set_mode: "after"
                }), An({
                    mode: "graph"
                }));
                break;
            case "memory_limit":
                60 < li.length && (li.splice(0, 20), ci = li.length - 1);
                break;
            case "clear":
                li = [], ci = -1, $.each(di, function(e) {
                    delete di[e]
                }), di = {};
                break;
            case "set_from_history":
                var t = JSON.copy(li[ci]),
                    _ = e.set_mode;
                switch ("undefined" != typeof t.need_layer_num && t.need_layer_num != yo && rl.find("[data-layer-num=\"" + t.need_layer_num + "\"]").trigger("click"), "undefined" != typeof t.need_axis && (Fo[t.need_axis.current_layer_name] = t.need_axis.g_x, Ao[t.need_axis.current_layer_name] = t.need_axis.g_y, drawGrid(), w(), Ke("=", Go.g_scale[vo], !0, !0)), "undefined" != typeof t.need_tab_scale && Ke("=", t.need_tab_scale, !0, !0), "undefined" != typeof t.need_tab_scale_mode && "undefined" != typeof t.need_tab_scale_mode[_] && Ke("=", t.need_tab_scale_mode[_], !0, !0), t.type) {
                    case "h_roof_columns_sheet_change":
                    case "h_roof_columns_sheet_btn_mode_add":
                    case "h_roof_columns_sheet_btn_mode_delete":
                    case "h_roof_columns_sheet_success_calc":
                    case "h_roof_columns_sheet_crossing_remove":
                    case "h_roof_columns_sheet_merge":
                        switch (t.type) {
                            case "h_roof_columns_sheet_change":
                            case "h_roof_columns_sheet_btn_mode_add":
                                sl.show();
                                break;
                            case "h_roof_columns_sheet_btn_mode_delete":
                            case "h_roof_columns_sheet_success_calc":
                            case "h_roof_columns_sheet_crossing_remove":
                            case "h_roof_columns_sheet_merge":
                                sl.hide();
                                break;
                            default:
                        }
                        switch (ii = Bi.findOne("#" + t.slope_id), oi = JSON.copy(t.g_selected_sheets), ii.attrs.columns_sheets = JSON.copy(t.slope_columns_sheets[_]), B_({
                                mode: "slope_graph_final"
                            }), t.type) {
                            case "h_roof_columns_sheet_success_calc":
                                0 < Object.keys(t.roof_data_params_tracking).length && ("undefined" == typeof t.roof_data_params_tracking.is_layer && (t.roof_data_params_tracking.is_layer = !0), t.roof_data_params_tracking.is_layer ? Mo[t.roof_data_params_tracking.param][vo] = t.roof_data_params_tracking[_] : console.log("\u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0441\u043C\u0435\u043D\u0443 \u043D\u0435\u0441\u043B\u043E\u0451\u043D\u043E\u0433\u043E \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0430"), ca());
                                break;
                            default:
                        }
                        break;
                    case "h_sheet_remove":
                        var a = parseInt(t.tab_data.sheet_tabs[0].tab_num),
                            r = "layer_" + a;
                        switch (_) {
                            case "before":
                                var n = {
                                        tab_name: t.tab_data.sheet_tabs[0].tab_name,
                                        tab_scale: t.tab_data.app_params.g_scale[r],
                                        tab_sheet_max_length: t.tab_data.roof_data_params.sheet_max_length[r],
                                        tab_offset_x: t.tab_data.roof_data_params.offset_x[r],
                                        tab_offset_y: t.tab_data.roof_data_params.offset_y[r],
                                        tab_cornice: t.tab_data.roof_data_params.cornice[r],
                                        tab_direction: t.tab_data.roof_data_params.direction[r],
                                        tab_direction_y: t.tab_data.roof_data_params.direction_y[r],
                                        tab_offset_run_type: t.tab_data.roof_data_params.offset_run_type[r],
                                        tab_sheet_length_text_mode: t.tab_data.roof_data_params.sheet_length_text_mode[r]
                                    },
                                    s = {};
                                "undefined" != typeof t.tab_data.tabs_axis_point.g_x[r] && "undefined" != typeof t.tab_data.tabs_axis_point.g_y[r] && (s = {
                                    g_x: t.tab_data.tabs_axis_point.g_x[r],
                                    g_y: t.tab_data.tabs_axis_point.g_y[r]
                                }), Fn(n, t.tab_data.cad_elements, a, t.type, s);
                                var o = rl.find(".d_bottom_tab").index(rl.find("[data-layer-num=\"" + a + "\"]")),
                                    i = parseInt(t.tab_data.sheet_tabs[0].tab_index);
                                o != i && (rl.find(".d_bottom_tab:eq(" + o + ")").insertAfter(rl.find(".d_bottom_tab:eq(" + (i - 1) + ")")), Oa());
                                break;
                            case "after":
                                d(a, !1);
                                break;
                            default:
                        }
                        break;
                    case "h_sheet_add":
                        var l = t.tab_text,
                            a = parseInt(t.tab_num);
                        switch (_) {
                            case "before":
                                d(a, !1);
                                break;
                            case "after":
                                configureLayerSettings({
                                    type: "",
                                    set_current_layer_num: a,
                                    set_tab_text: l,
                                    is_RoofSetCurrentLayerNameParams: !0,
                                    history: !1
                                });
                                break;
                            default:
                        }
                        break;
                    case "h_pline_add_esc_enter":
                    case "h_pline_add_paste_figure":
                        switch (_) {
                            case "before":
                                T(t.pline_data.id, {
                                    is_move_show: !1
                                }), SimpleCad.Action({
                                    type: "trash",
                                    is_history: !1
                                });
                                break;
                            case "after":
                                var p = createPolyline(JSON.copy(t.pline_data));
                                oa(p), to[vo].draw();
                                break;
                            default:
                        }
                        break;
                    case "h_mirror_hor_tab":
                        Xr({
                            history: !1
                        });
                        break;
                    case "h_mirror_hor_element_pline":
                        T(t.element_id, {
                            is_move_show: !1
                        }), Nr(Zi, !1), se(), oe(), ce(), Zi.stroke(mainColors.default_element_color), Zi = "undefined", to[vo].draw(), zi = "";
                        break;
                    case "h_rotate_element_pline":
                        switch (T(t.element_id, {
                                is_move_show: !1
                            }), _) {
                            case "before":
                                rotateElement(Zi, -1 * t.angle, !1);
                                break;
                            case "after":
                                rotateElement(Zi, t.angle, !1);
                                break;
                            default:
                        }
                        se(), oe(), ce(), Zi.stroke(mainColors.default_element_color), Zi = "undefined", to[vo].draw(), zi = "";
                        break;
                    case "h_trash_pline":
                        switch (_) {
                            case "before":
                                var p = createPolyline(JSON.copy(t.pline_data));
                                oa(p), N_(p), da(), to[vo].draw();
                                break;
                            case "after":
                                T(t.pline_data.id, {
                                    is_move_show: !1
                                }), SimpleCad.Action({
                                    type: "trash",
                                    is_history: !1
                                });
                                break;
                            default:
                        }
                        break;
                    case "h_pline_point_drag":
                    case "h_pline_move_point_controller":
                    case "pline_segment_highlight_set_length_modal":
                    case "h_pline_edit_break_pline":
                    case "figure_move_by_step":
                    case "figure_move_by_delta":
                    case "figure_move_by_point":
                        var m = Bi.findOne("#" + t.pline_data.id);
                        if (m.setPoints(JSON.copy(t.pline_data.points[_])), m.draw(), processAndClearElement(m), vt(m, !1), processElementAndAddMovePoints(m, !1), N_(m), da(), "undefined" != typeof t.g_current_move_point_data && tr(JSON.copy(t.g_current_move_point_data)), "block" == $("#move_point_controller").css("display")) {
                            var h = Ea();
                            null !== h && "undefined" != typeof h && "Circle" == h.className && (bi = "right_click", h.fire("click"))
                        }
                        "undefined" != typeof t.g_context_element_id && "undefined" != typeof t.g_figure_move_current_point_num && (zi = t.g_context_element_id, ki = t.g_figure_move_current_point_num, ha(zi), SimpleCad.Action({
                            type: "figure_controller",
                            mode: "move_context_click",
                            is_calc_pline_bottom_left_point: !1
                        }));
                        break;
                    case "h_click_object_visible":
                        Fi = !1, al.find("[data-obj-id=\"" + t.element_id + "\"]").parent().find("i.fa").trigger("click");
                        break;
                    case "h_figure_copy":
                        switch (_) {
                            case "before":
                                $.each(t.plines_data, function(e, t) {
                                    T(t.id, {
                                        is_move_show: !1
                                    }), SimpleCad.Action({
                                        type: "trash",
                                        is_history: !1
                                    })
                                });
                                break;
                            case "after":
                                $.each(t.plines_data, function(e, t) {
                                    var _ = createPolyline(JSON.copy(t));
                                    oa(_), to[vo].draw()
                                });
                                break;
                            default:
                        }
                        break;
                    default:
                }
                "block" == $("#figure_move_controller").css("display") && "undefined" == typeof t.g_context_element_id && "undefined" == typeof t.g_figure_move_current_point_num && SimpleCad.Action({
                    type: "figure_move_controller",
                    mode: "close"
                }), "block" == $("#move_point_controller").css("display") && "undefined" == typeof t.g_current_move_point_data && SimpleCad.Action({
                    type: "move_point_controller",
                    mode: "close"
                });
                break;
            default:
        }
    }

    function qn() {
        null !== Co.autosave && (clearInterval(Co.autosave), Co.autosave = null), 1 == Wo.settings_programm_autosave.is_use_autosave && 0 < Wo.settings_programm_autosave.autosave_interval && (Co.autosave = setInterval(function() {
            "" != qi && (SimpleCad.Action({
                type: "roof_save",
                is_restart_autosave: !1
            }), qi = "")
        }, 1e3 * (60 * Wo.settings_programm_autosave.autosave_interval)))
    }

    function Tn(e, t) {
        $("#" + e).val(t).select(), window.document.execCommand("copy")
    }

    function Sn(e) {
        for (var t = "", _ = 0, a, r; _ < e; _++) a = Math.floor(62 * Math.random()), r = a += 9 < a ? 36 > a ? 55 : 61 : 48, t += String.fromCharCode(r);
        return t
    }

    function Pn(e) {
        $("#notifications_all").prepend(e.html), setTimeout(function() {
            $("[data-notification-id=\"" + e.id + "\"]").remove()
        }, 5e3)
    }

    function In(e) {
        return e.id = Sn(12), {
            id: e.id,
            html: "<div data-notification-id=\"" + e.id + "\" class=\"notification_row\"><div class=\"notification_one " + {
                default: {
                    class: ""
                },
                success: {
                    class: "notification_one_success"
                },
                error: {
                    class: "notification_one_error"
                },
                wait: {
                    class: "notification_one_wait"
                }
            } [e.type]["class"] + "\">" + e.text + "</div></div>"
        }
    }

    function Yn(e) {
        Pn(In(e))
    }

    function Dn() {
        $("#notifications_all").empty()
    }

    function Xn() {
        if (Gs = {}, -1 < window.location.search.indexOf("?")) {
            var e = window.location.search.replace("?", "&"),
                t = e.split("&");
            $.each(t, function(e, t) {
                if (-1 < t.indexOf("=")) {
                    var _ = t.split("=");
                    2 == _.length && (Gs[_[0]] = _[1])
                }
            })
        }
        "undefined" == typeof Gs.uid && (Gs.uid = "")
    }

    function Gn() {
        history.replaceState({}, "\u041F\u0440\u043E\u0435\u043A\u0442\u043E\u0440 | Simple Cad", Xs), Xn()
    }

    function Wn() {
        "" != Gs.uid && (Yn({
            text: "\u041E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u0441\u0441\u044B\u043B\u043A\u0438...",
            type: "wait"
        }), K("roof_load", {
            type: "roof_load",
            uid: Gs.uid
        }))
    }

    function Kn() {
        switch (Mo.type) {
            case "mch_modul":
                return;
                break;
            default:
        }
        Js = !1;
        var e = [],
            t = Ct({
                what: ["pline_id", "pline_points", "pline_roof_calc", "pline_columns_sheets"],
                filter_type: ["pline"],
                filter_visible: "1",
                filter_is_object_visible: "1",
                filter_with_columns_sheets: "1",
                limit: 1
            });
        if (0 < t.length ? (t = t[0], e = JSON.copy(t.columns_sheets), $.each(e, function(t, _) {
                e[t] = Nn(_, [], 0)
            })) : showModalWindow("roof_crossing_remove_error_no_element", {}), Js) {
            var _ = Bi.findOne("#" + t.id);
            di = {
                type: "h_roof_columns_sheet_crossing_remove",
                need_layer_num: yo,
                need_tab_scale: Go.g_scale[vo],
                need_axis: {
                    g_x: Fo[vo],
                    g_y: Ao[vo],
                    current_layer_name: vo
                },
                slope_id: _.attrs.id,
                g_selected_sheets: {},
                slope_columns_sheets: {
                    before: JSON.copy(_.attrs.columns_sheets)
                }
            }, _.setAttrs({
                columns_sheets: e
            }), ae(), $_(_.id()), N_(_), da(), to[vo].draw(), di.slope_columns_sheets.after = JSON.copy(_.attrs.columns_sheets), An({
                mode: "add",
                element: di
            })
        }
        Js = !1
    }

    function Nn(e, t, _) {
        var a = [],
            r = {},
            n = 0,
            s = 0,
            o = "",
            i = t.length,
            l = !0;
        switch (Mo.type) {
            case "siding":
                r = {
                    cross_0: "right",
                    cross_1: "left",
                    summ_1: "right",
                    summ_0: "left",
                    if_valid_new_param: "left",
                    if_valid_new_param_2: "right"
                };
                break;
            default:
                r = {
                    cross_0: "top",
                    cross_1: "bottom",
                    summ_1: "top",
                    summ_0: "bottom",
                    if_valid_new_param: "bottom",
                    if_valid_new_param_2: "top"
                };
        }
        switch (1 < e.length ? (0 < i && (-1 == t.indexOf(_) || -1 == t.indexOf(_ + 1)) && (l = !1), e[0][r.cross_0] >= e[1][r.cross_1] && l ? (n = e[1][r.summ_1] - e[0][r.summ_0], Q_(n) ? o = "concat" : (s = n, n += 10, n = U_(n), o = Q_(n) && n > s ? "concat" : "skip")) : o = "skip") : o = "column", o) {
            case "concat":
                Js = !0, e[1][r.if_valid_new_param] = e[0][r.if_valid_new_param], e[1].length = n, e[1][r.if_valid_new_param_2] = e[1][r.if_valid_new_param] + n, a = a.concat(Nn(e.slice(1), t, _ + 1));
                break;
            case "skip":
                a.push(e[0]), a = a.concat(Nn(e.slice(1), t, _ + 1));
                break;
            case "column":
                a = e;
                break;
            default:
        }
        return a
    }

    function Vn(e) {
        switch (e.mode) {
            case "up":
            case "down":
            case "left":
            case "right":
                $("#target_" + e.figure_k + "_direction").val(e.mode), $("#target_" + e.figure_k + "_direction").parent().find(".figures_delta_btn").removeClass("active"), $("#target_" + e.figure_k + "_direction").parent().find(".js_figures_delta_btn_" + e.mode).addClass("active");
                break;
            default:
        }
    }

    function $n(e, t) {
        io[vo].x.setPoints([0, t, Bi.width(), t]), io[vo].y.setPoints([e, 0, e, Bi.height()]), io[vo].x.show(), io[vo].y.show(), io[vo].x.moveToTop(), io[vo].y.moveToTop(), Es[vo].moveToTop(), Zs[vo].moveToTop(), to[vo].batchDraw()
    }

    function En() {
        io[vo].x.hide(), io[vo].y.hide(), to[vo].batchDraw()
    }

    /**
     * Обрабатывает подсветку ортогональных осей при движении мыши.
     * Если курсор находится близко к осям, линии подсвечиваются, иначе возвращаются к стандартному цвету.
     *
     * @param {Object} event - Событие движения мыши.
     * @param {Object} event.evt - Нативный объект события.
     * @param {number} event.evt.layerX - Координата X курсора относительно слоя.
     * @param {number} event.evt.layerY - Координата Y курсора относительно слоя.
     */
    function handleOrthogonalAxisHighlight(event) {
        // Вычисляем расстояние от курсора до ортогональных осей
        var cursorDistances = {
            x: Math.abs(event.evt.layerX - io[vo].y.points()[0]),
            y: Math.abs(event.evt.layerY - io[vo].x.points()[1])
        };

        // Конфигурация для осей X и Y
        var axisConfig = {
            x: {
                orthoAxisHighlightKey: "y",
                orthoHighlightersKey: "y",
                sightAxis1: "_1",
                sightAxis3: "_3"
            },
            y: {
                orthoAxisHighlightKey: "x",
                orthoHighlightersKey: "x",
                sightAxis1: "_2",
                sightAxis3: "_4"
            }
        };

        // Если курсор находится близко к обеим осям, ничего не делаем
        if (cursorDistances.x <= 5 && cursorDistances.y <= 5) {
            return;
        }

        // Обрабатываем подсветку для каждой оси
        $.each(cursorDistances, function(axis, distance) {
            if (distance <= 5) {
                // Если курсор близко к оси, подсвечиваем её
                if (!lo[axisConfig[axis].orthoAxisHighlightKey]) {
                    _o[vo + axisConfig[axis].sightAxis1].setAttrs({
                        stroke: mainColors.sight_orto_highlighted_color
                    });
                    _o[vo + axisConfig[axis].sightAxis3].setAttrs({
                        stroke: mainColors.sight_orto_highlighted_color
                    });
                    io[vo][axisConfig[axis].orthoHighlightersKey].setAttrs({
                        stroke: mainColors.sight_orto_highlighted_color
                    });
                    lo[axisConfig[axis].orthoAxisHighlightKey] = true;
                }
            } else {
                // Если курсор далеко от оси, возвращаем стандартный цвет
                if (lo[axisConfig[axis].orthoAxisHighlightKey]) {
                    _o[vo + axisConfig[axis].sightAxis1].setAttrs({
                        stroke: mainColors.sight_color
                    });
                    _o[vo + axisConfig[axis].sightAxis3].setAttrs({
                        stroke: mainColors.sight_color
                    });
                    io[vo][axisConfig[axis].orthoHighlightersKey].setAttrs({
                        stroke: mainColors.orto_axis_highlighter
                    });
                    lo[axisConfig[axis].orthoAxisHighlightKey] = false;
                }
            }
        });
    }

    /**
     * Сбрасывает подсветку вспомогательных линий на холсте.
     * 
     * Устанавливает стандартный цвет для всех вспомогательных линий, чтобы убрать подсветку.
     */
    function resetHelperLineHighlighting() {
        // Сбрасываем цвет для первой вспомогательной линии
        _o[vo + "_1"].setAttrs({
            stroke: mainColors.sight_color
        });

        // Сбрасываем цвет для второй вспомогательной линии
        _o[vo + "_2"].setAttrs({
            stroke: mainColors.sight_color
        });

        // Сбрасываем цвет для третьей вспомогательной линии
        _o[vo + "_3"].setAttrs({
            stroke: mainColors.sight_color
        });

        // Сбрасываем цвет для четвёртой вспомогательной линии
        _o[vo + "_4"].setAttrs({
            stroke: mainColors.sight_color
        });
    }

    function Hn(e) {
        switch (e.mode) {
            case "keyup":
                var t = e.eventObject.keyCode;
                13 == t && Hn({
                    mode: "search"
                });
                break;
            case "change":
                break;
            case "clear":
                $("#files_table_search select").prop("selectedIndex", 0).val(), $("#files_table_search input[type=text]").val(""), Hn({
                    mode: "search"
                });
                break;
            case "search":
                $("#pagination_roof_open_modal_files").html(""), $("#roof_modal_files_list_table_tbody .js_tr_data").remove(), $("#roof_modal_files_list_table_tbody_tr_loading").show();
                var _ = $("#files_table_search").serializeArray();
                _ = Nt(_), _.page = 1, K("files_table_search", _);
                break;
            case "question":
                break;
            default:
        }
    }

    function Bn() {
        $("#roof_new_form_root").hide(), $("#modal_info_footer").hide(), $("#roof_new_tree_root").show(), $("#modal_info").removeClass("modal-lg").addClass("modal-full-width");
        var e = $("#r_d_root").height() - 225;
        $("#folders_tree").parent().css("height", e + "px"), e -= 30, $("#folders_tree_table_right_body").css("height", e + "px")
    }

    function Zn() {
        $("#roof_new_form_root").show(), $("#modal_info_footer").show(), $("#roof_new_tree_root").hide(), $("#modal_info").removeClass("modal-full-width").addClass("modal-lg")
    }

    function Jn(e) {
        e.thisObject.parent().hasClass("last") ? (e.item_n = e.thisObject.parent().data("item"), $("#folders_tree li.active").removeClass("active"), e.thisObject.parent().addClass("active"), Qn({
            item_n: e.item_n,
            page: "1"
        })) : e.thisObject.parent().toggleClass("opened")
    }

    function Qn(e) {
        $("#folders_tree_table_right_body_tbody").html("<tr><td colspan=\"2\" style=\"text-align:center !important;\">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...</td></tr>"), K("tree_table_update", {
            item_n: e.item_n,
            page: e.page
        })
    }

    function Un(e) {
        $("#roof_new_nomenclature").val(e.code_1c), SimpleCad.Action({
            type: "roof_new_nomenclature_change"
        }), Xt("roof_new_form"), Zn()
    }

    function es() {
        $("#r_d_root").addClass("nderight_mode");
        var e = $("#r_d_root").height() - 180;
        $("#nderight_accordion_body").css("max-height", e + "px"), SimpleCad.Action({
            type: "cad_toggle_show_grid"
        }), SimpleCad.Action({
            type: "cad_toggle_show_axis"
        }), SimpleCad.Action({
            type: "cad_toggle_show_columns_sheets"
        }), $("#nav_li_file_image").removeClass("disabled"), $("#roof_welcome").hide()
    }

    function ts() {}

    function _s() {
        return !0
    }

    function as(e) {
        var t = {
                points: [],
                pline_start: "empty",
                pline_start_val: "",
                pline_end: "empty",
                pline_end_val: "",
                side_okras: "empty",
                color: "",
                cover: "",
                thickness: "",
                size: "",
                amount: "",
                pline_breaks: {},
                pline_lengths_ish: []
            },
            _ = 0,
            a = 0,
            r = 0,
            n = 0,
            s = 0,
            o = [];
        return $.each(e.lengths, function(i, l) {
            switch (e.angles_mode) {
                case "y_line":
                    _ = e.angles[i];
                    break;
                case "line_line":
                    _ = e.angles[i];
                    break;
                default:
            }
            0 == i ? (a = Fo[vo], r = Ao[vo]) : (a = n, r = s), o = Ie(a, r, l, !0, _), 0 == i ? t.points = [o.points[0], o.points[1], o.points[2], o.points[3]] : t.points.push(o.points[2], o.points[3]), n = o.points[2], s = o.points[3]
        }), typeof("undefined" != e.pline_start) && "" != e.pline_start && (t.pline_start = e.pline_start), typeof("undefined" != e.pline_start_val) && (t.pline_start_val = e.pline_start_val), typeof("undefined" != e.pline_end) && "" != e.pline_end && (t.pline_end = e.pline_end), typeof("undefined" != e.pline_end_val) && (t.pline_end_val = e.pline_end_val), typeof("undefined" != e.side_okras) && "" != e.side_okras && (t.side_okras = e.side_okras), typeof("undefined" != e.color) && "" != e.color && (t.color = e.color), typeof("undefined" != e.cover) && "" != e.cover && (t.cover = e.cover), typeof("undefined" != e.thickness) && (t.thickness = e.thickness), typeof("undefined" != e.size) && (t.size = e.size), typeof("undefined" != e.amount) && (t.amount = e.amount), typeof("undefined" != e.pline_breaks) && (t.pline_breaks = e.pline_breaks), typeof("undefined" != e.pline_lengths_ish) && (t.pline_lengths_ish = e.pline_lengths_ish), ("zavalc_in" == t.pline_start || "zavalc_out" == t.pline_start) && 10 != parseFloat(t.pline_start_val) && (t.pline_start_val = 10, Yn({
            text: "\u0417\u0430\u0432\u0430\u043B\u044C\u0446\u043E\u0432\u043A\u0430 1 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0430 \u043D\u0430 10 \u043C\u043C",
            type: "wait"
        })), ("zavalc_in" == t.pline_end || "zavalc_out" == t.pline_end) && 10 != parseFloat(t.pline_end_val) && (t.pline_end_val = 10, Yn({
            text: "\u0417\u0430\u0432\u0430\u043B\u044C\u0446\u043E\u0432\u043A\u0430 2 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0430 \u043D\u0430 10 \u043C\u043C",
            type: "wait"
        })), t
    }

    function rs(e) {
        var t = e.points(),
            _ = t.length,
            a = 0,
            r = 0,
            n = 0,
            s = {},
            o = e.attrs.pline_lengths_ish,
            l = JSON.copy(e.attrs.pline_breaks),
            c = 0;
        Ll.empty(), Ol.empty();
        for (var d = 0; d < (_ - 2) / 2; d++) a = "undefined" == typeof o[d] ? 0 : o[d], 0 < r ? (n = calculateAngle(t[2 * r + 0 - 2], t[2 * r + 1 - 2], t[2 * r + 2 - 2], t[2 * r + 3 - 2], t[2 * r + 4 - 2], t[2 * r + 5 - 2], !0, !0, !1), isNaN(n) && (n = 0), n = parseFloat(n.toFixed(2))) : n = 0, c = 0, "undefined" != typeof l["l" + d] && -1 !== $.inArray(parseInt(l["l" + d]), Ei) && (c = parseInt(l["l" + d])), s = {
            type: "size_angle",
            row_counter: r,
            length: a,
            angle: n,
            element_id: e.id(),
            pline_break: c
        }, ns(s), r++;
        s = {
            type: "zavalc",
            param: "pline_start",
            pline_start: e.attrs.pline_start,
            value: e.attrs.pline_start_val,
            num: 1,
            focus: 2 * r - 1,
            element_id: e.id()
        }, ns(s), s = {
            type: "zavalc",
            param: "pline_end",
            pline_end: e.attrs.pline_end,
            value: e.attrs.pline_end_val,
            num: 2,
            focus: 2 * r,
            element_id: e.id()
        }, ns(s), s = {
            type: "side_okras",
            side_okras: e.attrs.side_okras,
            element_id: e.id()
        }, ns(s), s = {
            type: "prod_nom_param",
            param: "prod_color",
            param2: "color",
            text: "\u0426\u0432\u0435\u0442",
            param_val: e.attrs.prod_color,
            element_id: e.id(),
            focus: 2 * r + 1
        }, ns(s), s = {
            type: "prod_nom_param",
            param: "prod_cover",
            param2: "cover",
            text: "\u041F\u043E\u043A\u0440\u044B\u0442\u0438\u0435",
            param_val: e.attrs.prod_cover,
            element_id: e.id(),
            focus: 2 * r + 2
        }, ns(s), s = {
            type: "prod_nom_param",
            param: "prod_thickness",
            param2: "thickness",
            text: "\u0422\u043E\u043B\u0449\u0438\u043D\u0430",
            param_val: e.attrs.prod_thickness,
            element_id: e.id(),
            focus: 2 * r + 3
        }, ns(s), s = {
            type: "prod_nom_param",
            param: "prod_size",
            param2: "size",
            text: "\u0414\u043B\u0438\u043D\u0430",
            param_val: e.attrs.prod_size,
            element_id: e.id(),
            focus: 2 * r + 4
        }, ns(s), s = {
            type: "amount",
            amount: e.attrs.prod_amount,
            element_id: e.id(),
            focus: 2 * r + 5
        }, ns(s), s = {
            type: "size_summ",
            summ: 0
        }, ns(s), ds(e.id())
    }

    function ns(e) {
        var t = "";
        switch (e.type) {
            case "size_angle":
                switch (e.row_counter) {
                    case 0:
                        var _ = "selected=\"selected\"";
                        0 < e.pline_break && (_ = "");
                        var a = "",
                            r = "";
                        $.each(Ei, function(t, _) {
                            r = "", e.pline_break == _ && (r = "selected=\"selected\""), a += "<option value=\"" + _ + "\" " + r + ">" + (_ / 100).toFixed(1) + "</option>"
                        }), t = `
							<div class="nde_tbl_row_size_ang">
								<div class="nde_tbl_row_size_ang_l">L1</div>
								<div class="nde_tbl_row_size_ang_l_inp nde_tbl_row_size_ang_l_inp_of_one">
									<input type="text" class="form-control" value="` + e.length + `" data-focus="0" 
										onfocus="SimpleCad.Action({  'type' :'nde_inp_focus', 'thisObject':$(this), 'param':'size', 'num':0, 'element_id':'` + e.element_id + `'  })"
										onblur="SimpleCad.Action({ 	'type' :'nde_inp_blur',  'thisObject':$(this), 'param':'size', 'num':0, 'element_id':'` + e.element_id + `' })"
										onkeyup="SimpleCad.Action({	'type' :'nde_inp_keyup', 'thisObject':$(this), 'param':'size', 'eventObject':event })" >
								</div>
								<div class="nde_tbl_row_size_ang_br">-&wreath;&wreath;-</div>
								<div class="nde_tbl_row_size_ang_br_sel">
									<select class="form-control" tabindex="-1" onchange="SimpleCad.Action({'type':'nde_select_change', 'thisObject':$(this), 'param':'pline_breaks', 'num' : ` + e.row_counter + ` , 'element_id':'` + e.element_id + `' });">
										<option value="0" ` + _ + `></option>` + a + `
									</select>
								</div>
							</div>
						`;
                        break;
                    default:
                        var _ = "selected=\"selected\"";
                        0 < e.pline_break && (_ = "");
                        var a = "",
                            r = "";
                        $.each(Ei, function(t, _) {
                            r = "", e.pline_break == _ && (r = "selected=\"selected\""), a += "<option value=\"" + _ + "\" " + r + ">" + (_ / 100).toFixed(1) + "</option>"
                        }), t = `
							<div class="nde_tbl_row_size_ang">
								<div class="nde_tbl_row_size_ang_l">L` + (e.row_counter + 1) + `</div>
								<div class="nde_tbl_row_size_ang_l_inp">
									<input type="text" class="form-control" value="` + e.length + `" data-focus="` + (2 * e.row_counter - 1) + `" 
									onfocus="SimpleCad.Action({ 'type':'nde_inp_focus', 'thisObject':$(this), 'param':'size', 'num':` + e.row_counter + `, 'element_id':'` + e.element_id + `' })"  
									onblur="SimpleCad.Action({  'type':'nde_inp_blur',  'thisObject':$(this), 'param':'size', 'num':` + e.row_counter + `, 'element_id':'` + e.element_id + `' })" 
									onkeyup="SimpleCad.Action({ 'type':'nde_inp_keyup', 'thisObject':$(this), 'param':'size', 'eventObject':event })" >
								</div>
								<div class="nde_tbl_row_size_ang_ang">&ang;` + e.row_counter + `</div>
								<div class="nde_tbl_row_size_ang_ang_inp">
									<input type="text" class="form-control" value="` + e.angle + `" data-focus="` + 2 * e.row_counter + `" 
									onfocus="SimpleCad.Action({ 'type':'nde_inp_focus', 'thisObject':$(this), 'param':'angle', 'num':` + (e.row_counter - 1) + `, 'element_id':'` + e.element_id + `' })" 
									onblur="SimpleCad.Action({  'type':'nde_inp_blur',  'thisObject':$(this), 'param':'angle', 'num':` + (e.row_counter - 1) + `, 'element_id':'` + e.element_id + `' })" 
									onkeyup="SimpleCad.Action({ 'type':'nde_inp_keyup', 'thisObject':$(this), 'param':'angle', 'eventObject':event })" >
								</div>
								<div class="nde_tbl_row_size_ang_br">-&wreath;&wreath;-</div>
								<div class="nde_tbl_row_size_ang_br_sel">
									<select class="form-control" tabindex="-1" onchange="SimpleCad.Action({'type':'nde_select_change', 'thisObject':$(this), 'param':'pline_breaks', 'num' : ` + e.row_counter + ` , 'element_id':'` + e.element_id + `' });">
										<option value="0" ` + _ + `></option>` + a + `
									</select>
								</div>
							</div>
						`;
                }
                break;
            case "zavalc":
                var n = "zavalc_out" == e[e.param] ? "checked=\"checked\"" : "",
                    s = "zavalc_in" == e[e.param] ? "checked=\"checked\"" : "",
                    o = "empty" == e[e.param] ? "checked=\"checked\"" : "";
                isNaN(parseInt(e.value)) && (e.value = 0);
                var i = 0 == parseInt(e.value) ? "readonly" : "";
                i = "readonly", t = `
					<div class="nde_tbl_row_size_ang">
						<div class="nde_tbl_row_size_ang_l" >&sup;` + e.num + `</div>
						<div class="nde_tbl_row_size_ang_l_inp nde_tbl_row_size_ang_l_inp_of_zavalc">
							<input type="text" tabindex="-1" class="form-control js_inp_zavalc_val" ` + i + ` name="` + e.param + `_val" value="` + e.value + `" data-focus="` + e.focus + `"
							onfocus="SimpleCad.Action({ 'type':'nde_inp_focus', 'thisObject':$(this), 'param':'zavalc_val', 'zavalc_param':'` + e.param + `', 'zavalc_param_direct':'` + e[e.param] + `', 'element_id':'` + e.element_id + `' })" 
							onblur="SimpleCad.Action({  'type':'nde_inp_blur',  'thisObject':$(this), 'param':'zavalc_val', 'zavalc_param':'` + e.param + `', 'zavalc_param_direct':'` + e[e.param] + `', 'element_id':'` + e.element_id + `' })" 
							onkeyup="SimpleCad.Action({ 'type':'nde_inp_keyup', 'thisObject':$(this), 'param':'zavalc_val', 'zavalc_param':'` + e.param + `', 'zavalc_param_direct':'` + e[e.param] + `', 'element_id':'` + e.element_id + `', 'eventObject':event })" >
						</div>	
						<div class="nde_tbl_row_zavalc_radios">
							<label>
								<input type="radio" tabindex="-1" name="` + e.param + `" value="zavalc_out" ` + n + ` 
								onchange="SimpleCad.Action({ 'type':'nde_radio_change', 'thisObject':$(this), 'param':'zavalc_direction', 'zavalc_param':'` + e.param + `', 'val':'zavalc_out', 'element_id':'` + e.element_id + `' })" >
								<span>&curvearrowleft;</span>
							</label>
							<label>
								<input type="radio" tabindex="-1" name="` + e.param + `" value="zavalc_in" ` + s + ` 
								onchange="SimpleCad.Action({ 'type':'nde_radio_change', 'thisObject':$(this), 'param':'zavalc_direction', 'zavalc_param':'` + e.param + `', 'val':'zavalc_in', 'element_id':'` + e.element_id + `' })" >
								<span>&curvearrowright;</span>
							</label>
							<label>
								<input class="js_empty" type="radio" tabindex="-1" name="` + e.param + `" value="empty" ` + o + ` 
								onchange="SimpleCad.Action({ 'type':'nde_radio_change', 'thisObject':$(this), 'param':'zavalc_direction', 'zavalc_param':'` + e.param + `', 'val':'empty', 'element_id':'` + e.element_id + `' })" >
								<span>&times;</span>
							</label>
						</div>											
					</div>		
				`;
                break;
            case "side_okras":
                var l = "top_down" == e.side_okras ? "checked=\"checked\"" : "",
                    c = "bottom_up" == e.side_okras ? "checked=\"checked\"" : "",
                    d = "empty" == e.side_okras ? "checked=\"checked\"" : "";
                t = `
					<div class="nde_tbl_row_size_ang">
						<div class="nde_tbl_row_other_left">
							Сторона окраса
						</div>
						<div class="nde_tbl_row_other_right">
							<div class="nde_tbl_row_zavalc_radios">
								<label>
									<input type="radio" tabindex="-1" name="side_okras" value="top_down" ` + l + ` 
									onchange="SimpleCad.Action({ 'type':'nde_radio_change', 'thisObject':$(this), 'param':'side_okras_direction', 'val':'top_down', 'element_id':'` + e.element_id + `' })" >
									<span>&ShortDownArrow;</span>
								</label>
								<label>
									<input type="radio" tabindex="-1" name="side_okras" value="bottom_up" ` + c + ` 
									onchange="SimpleCad.Action({ 'type':'nde_radio_change', 'thisObject':$(this), 'param':'side_okras_direction', 'val':'bottom_up', 'element_id':'` + e.element_id + `' })" >
									<span>&ShortUpArrow;</span>
								</label>
								<label>
									<input type="radio" tabindex="-1" name="side_okras" value="empty" ` + d + ` 
									onchange="SimpleCad.Action({ 'type':'nde_radio_change', 'thisObject':$(this), 'param':'side_okras_direction', 'val':'empty', 'element_id':'` + e.element_id + `' })" >
									<span>&times;</span>
								</label>
							</div>	
						</div>
					</div>	
				`;
                break;
            case "prod_nom_param":
                var _ = "selected=\"selected\"";
                "" != e.param_val && $.each(mo[e.param2], function(t, a) {
                    if (e.param_val == a) return _ = "", !1
                });
                var a = "",
                    r = "";
                $.each(mo[e.param2], function(t, n) {
                    r = "", "" == _ && e.param_val == n && (r = "selected=\"selected\""), a += "<option value=\"" + n + "\" " + r + " >" + n + "</option>"
                }), t = `
					<div class="nde_tbl_row_size_ang">
						<div class="nde_tbl_row_other_left"> ` + e.text + `
						</div>
						<div class="nde_tbl_row_other_right_sel">													
							<select id="nde_table_` + e.param + `_val" class="form-control" data-focus="` + e.focus + `"
								onchange="SimpleCad.Action({'type':'nde_select_change', 'thisObject':$(this), 'param':'` + e.param + `', 'element_id':'` + e.element_id + `' });" >
								<option value="" ` + _ + ` ></option> ` + a + `								
							</select>
						</div>
					</div>
				`;
                break;
            case "amount":
                t = `
					<div class="nde_tbl_row_size_ang">
						<div class="nde_tbl_row_other_left">
							Кол-во
						</div>
						<div class="nde_tbl_row_other_right_sel">
							<input id="nde_table_amount_val" type="text" class="form-control" value="` + e.amount + `"  data-focus="` + e.focus + `"
								onfocus="SimpleCad.Action({ 'type':'nde_inp_focus', 'thisObject':$(this), 'param':'amount', 'element_id':'` + e.element_id + `' })" 
								onblur="SimpleCad.Action({  'type':'nde_inp_blur',  'thisObject':$(this), 'param':'amount', 'element_id':'` + e.element_id + `' })" 
								onkeyup="SimpleCad.Action({ 'type':'nde_inp_keyup', 'thisObject':$(this), 'param':'amount', 'eventObject':event })">
						</div>
					</div>
				`;
                break;
            case "size_summ":
                t = `
					<div class="nde_tbl_row_size_ang">
						<div class="nde_tbl_row_other_left">
							Развертка, мм
						</div>
						<div class="nde_tbl_row_other_right_sel">
							<span id="nde_table_razv_val">` + e.summ + `</span>
						</div>
					</div>	
				`;
                break;
            default:
        }
        switch (e.type) {
            case "size_angle":
                Ll.append(t);
                break;
            case "zavalc":
            case "side_okras":
            case "size_summ":
            case "prod_nom_param":
            case "amount":
                Ol.append(t);
                break;
            default:
        }
    }

    function ss(e) {
        switch (e.param) {
            case "size":
                e.thisObject.select(), m_(e.element_id, e.num + 1);
                break;
            case "angle":
                e.thisObject.select(), u_(e.element_id, e.num + 1);
                break;
            case "zavalc_val":
                e.thisObject.select(), h_(e.element_id, e.zavalc_param, e.zavalc_param_direct);
                break;
            case "amount":
                e.thisObject.select();
                break;
            default:
        }
    }

    function os(e) {
        switch (e.param) {
            case "size":
            case "angle":
            case "zavalc_val":
            case "amount":
                var t = e.eventObject.keyCode;
                if (13 == t) {
                    var _ = e.thisObject[0].attributes["data-focus"].value;
                    _ = parseInt(_) + 1, $("#nderight_accordion_body").find("[data-focus=\"" + _ + "\"]").focus(), "amount" == e.param && e.thisObject.trigger("blur")
                }
                break;
            default:
        }
    }

    // Функционал доборный элемент изменение параметров
    function is(e) {
        var t = 0;
        switch (f_(e.element_id), e.param) {
            case "size":
                var _ = As(e.num, e.element_id),
                    a = _ ? 10 : 15;
                t = Math.abs(U(e.thisObject.val())), t = Math.round_precision(t, 1), t < a && (t = a), e.thisObject.val(t), an(e.element_id, e.num, t, !0);
                break;
            case "angle":
                t = U(e.thisObject.val()), t = Math.round_precision_nearest(t, 5), -0 == t && (t = 0), 0 == t || (0 < t ? 35 > t && (t = 35) : 0 > t && -35 < t && (t = -35)), e.thisObject.val(t), rn(e.element_id, e.num, t);
                break;
            case "zavalc_val":
                t = Math.abs(U(e.thisObject.val())), t = parseInt(t.toFixed(0)), 0 < t && 5 > t && (t = 5), e.thisObject.val(t), Jr(e.element_id, e.zavalc_param, t), 0 == t && e.thisObject.parent().parent().find(".js_empty").trigger("click");
                break;
            case "amount":
                t = Math.abs(U(e.thisObject.val())), t = parseInt(t.toFixed(0)), 0 >= t && (t = ""), e.thisObject.val(t), en(e.element_id, "prod_amount", t);
                break;
            default:
        }
        switch (refreshCurrentLayer(), ds(e.element_id), e.param) {
            case "size":
                var r = Bi.findOne("#" + e.element_id);
                _n(e.element_id, {
                    mode: "length_one",
                    num: e.num,
                    val: t
                }), fs(r), ds(e.element_id), updateElementParametersDisplay(r), refreshCurrentLayer();
                break;
            default:
        }
    }

    function ls(e) {
        switch (e.param) {
            case "zavalc_direction":
                if (Qr(e.element_id, e.zavalc_param, e.val), "empty" == e.val) Jr(e.element_id, e.zavalc_param, 0), e.thisObject.parent().parent().parent().find(".js_inp_zavalc_val").val(0).prop("readonly", !0);
                else {
                    e.thisObject.parent().parent().parent().find(".js_inp_zavalc_val").prop("readonly", !1), e.thisObject.parent().parent().parent().find(".js_inp_zavalc_val").prop("readonly", !0);
                    var t = parseInt(e.thisObject.parent().parent().parent().find(".js_inp_zavalc_val").val());
                    isNaN(t) && (t = 0), 0 == t && (Jr(e.element_id, e.zavalc_param, 10), e.thisObject.parent().parent().parent().find(".js_inp_zavalc_val").val(10))
                }
                refreshCurrentLayer(), ds(e.element_id);
                break;
            case "side_okras_direction":
                Ur(e.element_id, e.val), refreshCurrentLayer();
                break;
            default:
        }
    }

    function cs(e) {
        switch (e.param) {
            case "prod_color":
            case "prod_cover":
            case "prod_thickness":
            case "prod_size":
                en(e.element_id, e.param, e.thisObject.val()), refreshCurrentLayer();
                break;
            case "pline_breaks":
                tn(e.element_id, e.num, parseInt(e.thisObject.val()));
                var t = Bi.findOne("#" + e.element_id),
                    _ = t.attrs.pline_lengths_ish,
                    a = _[e.num];
                0 == e.thisObject.val() ? (an(e.element_id, e.num, a, !0), refreshCurrentLayer()) : (fs(t), refreshCurrentLayer());
                break;
            default:
        }
    }

    function ds(e) {
        var t = Bi.findOne("#" + e),
            _ = ps(t, !0, "pline_lengths_ish");
        _ = parseFloat(_.toFixed(3)), $("#nde_table_razv_val").html(_)
    }

    function ps(e, t, _) {
        var a = 0,
            r = e.attrs.pline_lengths_ish;
        switch (_) {
            case "pline_lengths_ish":
                $.each(r, function(e, t) {
                    a += t
                }), t && (-1 !== $.inArray(e.attrs.pline_start, ["zavalc_in", "zavalc_out"]) && (a += e.attrs.pline_start_val), -1 !== $.inArray(e.attrs.pline_end, ["zavalc_in", "zavalc_out"]) && (a += e.attrs.pline_end_val));
                break;
            default:
        }
        return a
    }

    function ms() {
        "sznde" != ei.type || $.each(to[vo].children, function(e, t) {
            if ("Line" == t.className && "undefined" != typeof t.attrs.side_okras) return hs(t), updateElementParametersDisplay(t), !1
        })
    }

    function hs(e) {
        if ("sznde" == ei.type)
            if ("empty" == e.attrs.side_okras) co.arrow[vo].hide();
            else {
                var t = Ee(vo, !1, !1, !1, !1);
                t.x_mid = t.x_max - (t.x_max - t.x_min) / 2;
                var _ = [];
                switch (e.attrs.side_okras) {
                    case "top_down":
                        _ = [t.x_mid, t.y_min - 60 - 35, t.x_mid, t.y_min - 35];
                        break;
                    case "bottom_up":
                        _ = [t.x_mid, t.y_max + 60 + 35, t.x_mid, t.y_max + 35];
                        break;
                    default:
                }
                co.arrow[vo].attrs.points = _, co.arrow[vo].show()
            }
    }

    /**
     * Обновляет отображение информации о параметрах элемента на холсте.
     * 
     * Отображает такие параметры, как цвет, покрытие, толщина, длина, количество и развёртка.
     * Также рассчитывает размеры текстовых блоков и размещает их на холсте.
     * 
     * @param {Object} e - Элемент, для которого нужно обновить отображение информации.
     */
    function updateElementParametersDisplay(e) {
        if ("sznde" == ei.type && ! isRotateClick) {
            var t = e.attrs.prod_color,
                _ = e.attrs.prod_cover,
                a = e.attrs.prod_thickness,
                r = ps(e, !0, "pline_lengths_ish");
            r = parseFloat(r.toFixed(3));
            var n = e.attrs.prod_size,
                s = e.attrs.prod_amount,
                o = 50;
            "bottom_up" == e.attrs.side_okras && (o = 35);
            var i = 8,
                l = 8,
                c = Ee(vo, !1, !0, !1, !1),
                d = 8 * t.length + 20,
                p = 80;
            d < p && (d = p);
            var m = 8 * _.length + 20,
                h = 80;
            m < h && (m = h);
            var u = 80,
                f = 80,
                g = d + m + 80 + u + f + 80,
                y = c.x_min,
                b = y + g,
                v = c.y_max + o,
                x = v + 30,
                w = x + 30,
                k = y + d,
                z = k + m,
                j = z + 80,
                C = j + u,
                L = C + f,
                O = y + l,
                F = v + i,
                A = k + l,
                q = z + l,
                T = j + l,
                S = C + l,
                P = L + l,
                I = x + i;
            po.hor1[vo].attrs.points = [y, v, b, v], po.hor1[vo].show(), po.hor2[vo].attrs.points = [y, x, b, x], po.hor2[vo].show(), po.hor3[vo].attrs.points = [y, w, b, w], po.hor3[vo].show(), po.ver1[vo].attrs.points = [y, v, y, w], po.ver1[vo].show(), po.ver2[vo].attrs.points = [k, v, k, w], po.ver2[vo].show(), po.ver3[vo].attrs.points = [z, v, z, w], po.ver3[vo].show(), po.ver4[vo].attrs.points = [j, v, j, w], po.ver4[vo].show(), po.ver5[vo].attrs.points = [C, v, C, w], po.ver5[vo].show(), po.ver6[vo].attrs.points = [L, v, L, w], po.ver6[vo].show(), po.ver7[vo].attrs.points = [b, v, b, w], po.ver7[vo].show(), po.h1[vo].setAttrs({
                x: O,
                y: F,
                text: "\u0446\u0432\u0435\u0442",
                visible: !0
            }), po.h2[vo].setAttrs({
                x: A,
                y: F,
                text: "\u043F\u043E\u043A\u0440\u044B\u0442\u0438\u0435",
                visible: !0
            }), po.h3[vo].setAttrs({
                x: q,
                y: F,
                text: "\u0442\u043E\u043B\u0449\u0438\u043D\u0430",
                visible: !0
            }), po.h4[vo].setAttrs({
                x: T,
                y: F,
                text: "\u0434\u043B\u0438\u043Da",
                visible: !0
            }), po.h5[vo].setAttrs({
                x: S,
                y: F,
                text: "\u043A\u043E\u043B-\u0432\u043E",
                visible: !0
            }), po.h6[vo].setAttrs({
                x: P,
                y: F,
                text: "\u0440\u0430\u0437\u0432\u0435\u0440\u0442\u043A\u0430",
                visible: !0
            }), po.r1v1[vo].setAttrs({
                x: O,
                y: I,
                text: t,
                visible: !0
            }), po.r1v2[vo].setAttrs({
                x: A,
                y: I,
                text: _,
                visible: !0
            }), po.r1v3[vo].setAttrs({
                x: q,
                y: I,
                text: a,
                visible: !0
            }), po.r1v4[vo].setAttrs({
                x: T,
                y: I,
                text: n,
                visible: !0
            }), po.r1v5[vo].setAttrs({
                x: S,
                y: I,
                text: s,
                visible: !0
            }), po.r1v6[vo].setAttrs({
                x: P,
                y: I,
                text: r,
                visible: !0
            })
        }
    }


    function fs(e) {
        if (0 < Object.keys(e.attrs.pline_breaks).length) {
            for (var t = e.points(), _ = t.length, a = JSON.copy(e.attrs.pline_breaks), r = 0, n = e.attrs.pline_lengths_ish, s = 0, o = 0, l = 0; l < (_ - 2) / 2; l++) "undefined" != typeof a["l" + l] && -1 !== $.inArray(parseInt(a["l" + l]), Ei) && (r = parseInt(a["l" + l]), s = n[l], o = parseFloat((s / 100 * r).toFixed(3)), an(e.id(), l, o, !0), is_changed = !0);
            is_changed && refreshCurrentLayer()
        }
    }

    function gs() {
        $.each(to[vo].children, function(e, t) {
            if ("Line" == t.className && "undefined" != typeof t.attrs.side_okras) return T(t.id(), {
                is_move_show: !1
            }), !1
        })
    }

    function ys() {
        $.each(po, function(e, t) {
            $.each(t, function(e, t) {
                t.hide()
            })
        }), co.arrow[vo].hide(), $("#nde_tbl_row_size_ang_list").html(""), $("#nde_tbl_row_other_list").html(""), to[vo].draw()
    }

    function bs() {
        var e = "",
            t = 0,
            _ = {},
            a = "";
        ho = !1, $.each(to[vo].children, function(_, a) {
            "Line" == a.className && "undefined" != typeof a.attrs.side_okras && (e = a.id(), t++)
        }), 1 == t ? (_ = validateElementConfiguration(e), 0 == _.errors.length ? (Yn({
            text: "\u041E\u0448\u0438\u0431\u043E\u043A \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E",
            type: "success"
        }), ho = !0) : (a = vs(_.errors, "modal_nde_validate_errors"), showModalWindow("nde_validate_errors", {
            errors_html: a
        }))) : 0 == t ? Yn({
            text: "\u042D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E",
            type: "error"
        }) : Yn({
            text: "\u041D\u0430\u0439\u0434\u0435\u043D\u043E \u0431\u043E\u043B\u044C\u0448\u0435 \u043E\u0434\u043D\u043E\u0433\u043E \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
            type: "error"
        })
    }

    function vs(e) {
        var t = "<ul class=\"gl_form_err_ul\">";
        return $.each(e, function(e, _) {
            t += "<li><i class=\"fa fa-exclamation-triangle\"></i> " + _.message + "</li>"
        }), t += "</ul>", t
    }

    function xs() {
        if (bs(), ho) {
            uo = {};
            to[vo].toImage({
                callback: function(e) {
                    uo.tab_img_src = e.src, uo.tab_region = Ee(vo, !1, !0, !0, !0), K("nde_check_and_attach_crop_image", {
                        image: uo
                    })
                }
            })
        }
    }

    function ws(e) {
        var t = {
                base64: e.base64_croped,
                nde_data_color: $("#nde_table_prod_color_val").val(),
                nde_data_surface: $("#nde_table_prod_cover_val").val(),
                nde_data_thickness: $("#nde_table_prod_thickness_val").val().replace(".", ","),
                nde_data_size: (parseInt($("#nde_table_prod_size_val").val()) / 1e3).toFixed(1).replace(".", ","),
                nde_data_amount: parseInt($("#nde_table_amount_val").val()).toFixed(0),
                nde_data_full_width: parseInt($("#nde_table_razv_val").html()).toFixed(0)
            },
            _ = new URLSearchParams(window.location.search),
            a = _.get("ugid"),
            r = Ss + "nde/save-base64-png/" + a + "/";
        r = Ss + "go/api/nde/save-base64-png/" + a + "/", $.ajax({
            url: r,
            type: "post",
            data: JSON.stringify(t),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            traditional: !0,
            success: function() {},
            error: function() {}
        })
    }


    /**
     * Проверяет конфигурацию элемента на наличие ошибок.
     * Проверяет длины, углы, заваливания, параметры окраски и другие характеристики.
     * 
     * @param {string} elementId - ID проверяемого элемента
     * @returns {Object} Объект с результатами валидации:
     *   - errors: массив найденных ошибок
     *   - каждая ошибка содержит тип, параметры и сообщение об ошибке
     */
    function validateElementConfiguration(elementId) {
        // Инициализируем объект для хранения результатов валидации
        var validationResult = {
            errors: []
        };

        // Получаем элемент по ID
        var element = Bi.findOne("#" + elementId);
        
        // Получаем массив точек элемента
        var points = element.points();
        var pointsCount = points.length;
        
        // Счетчики и флаги
        var currentLength = 0;
        var segmentIndex = 0;
        var angle = 0;
        var isEndSegment = false;
        var minLength = 0;
        var lengthMessage = "";
        var totalLength = 0;
        
        // Получаем длины сегментов
        var segmentLengths = element.attrs.pline_lengths_ish;

        // Правила валидации полей
        var validationRules = [{
            name: "prod_cover",
            type: "str", 
            message: "Укажите покрытие"
        }, {
            name: "prod_thickness",
            type: "str",
            message: "Укажите толщину"
        }, {
            name: "prod_size",
            type: "str", 
            message: "Укажите длину"
        }, {
            name: "prod_amount",
            type: "int_ceil",
            message: "Укажите количество",
            message_zero: "Кол-во должно быть больше нуля",
            message_precision: "Кол-во должно быть кратно 1"
        }];

        // Проверяем каждый сегмент полилинии
        for(var i = 0; i < (pointsCount - 2)/2; i++) {
            currentLength = segmentLengths[segmentIndex];

            // Проверяем точность длины
            if(currentLength % 1 > 0) {
                validationResult.errors.push({
                    type: "length_precision",
                    precision: 1,
                    segment_num: segmentIndex,
                    message: "Длина полки должна быть кратна 1 мм (L" + (segmentIndex + 1) + ")"
                });
            }

            // Проверяем является ли сегмент крайним
            isEndSegment = qs(i, pointsCount);
            minLength = isEndSegment ? 10 : 15;
            lengthMessage = isEndSegment ? 
                "Минимальная длина крайней полки - " :
                "Минимальная длина некрайней полки - ";

            // Проверяем минимальную длину
            if(currentLength < minLength) {
                validationResult.errors.push({
                    type: "length_minimum",
                    segment_num: segmentIndex, 
                    message: lengthMessage + minLength + " мм (L" + (segmentIndex + 1) + ")"
                });
            }

            // Проверяем углы между сегментами
            if(segmentIndex > 0) {
                angle = calculateAngle(
                    points[2*segmentIndex + 0 - 2],
                    points[2*segmentIndex + 1 - 2], 
                    points[2*segmentIndex + 2 - 2],
                    points[2*segmentIndex + 3 - 2],
                    points[2*segmentIndex + 4 - 2],
                    points[2*segmentIndex + 5 - 2],
                    true, true, false
                );

                if(isNaN(angle)) {
                    angle = 0;
                }
                angle = parseFloat(angle.toFixed(2));

                // Проверяем кратность угла
                if(Math.abs(angle % 1) > 0) {
                    validationResult.errors.push({
                        type: "angle_precision",
                        precision: 1,
                        angle_num: segmentIndex - 1,
                        message: "Угол должен быть кратен 1° (∠" + segmentIndex + ")"
                    });
                }

                // Проверяем минимальный угол
                if(Math.abs(angle) > 0 && Math.abs(angle) < 35) {
                    validationResult.errors.push({
                        type: "angle_minimum", 
                        angle_num: segmentIndex - 1,
                        message: "Минимальный угол (кроме обратного загиба) 35° (∠" + segmentIndex + ")"
                    });
                }
            }

            segmentIndex++;
        }

        // Проверяем заваливания
        $.each(["pline_start", "pline_end"], function(index, param) {
            switch(element.attrs[param]) {
                case "zavalc_in":
                case "zavalc_out":
                    if(parseFloat(element.attrs[param + "_val"]) != 10) {
                        validationResult.errors.push({
                            type: "zavalc_minimum",
                            zavalc_num: param,
                            message: "Разрешена завальцовка только 10 мм (⊃" + (index + 1) + ")"
                        });
                    }
                    break;
                default:
            }
        });

        // Проверяем наличие покрытия и цвета
        var isZinc = element.attrs.prod_cover.toString() == "Цинк";

        if(element.attrs.side_okras !== "" && element.attrs.side_okras !== "empty") {
            if(isZinc) {
                validationResult.errors.push({
                    type: "param_not_correct",
                    param: "side_okras", 
                    message: "Для цинка не надо указывать сторону окраса"
                });
            }
        } else {
            if(!isZinc) {
                validationResult.errors.push({
                    type: "param_empty",
                    param: "side_okras",
                    message: "Укажите сторону окраса" 
                });
            }
        }

        if(element.attrs.prod_color.toString() === "") {
            if(!isZinc) {
                validationResult.errors.push({
                    type: "param_empty",
                    param: "prod_color",
                    message: "Укажите цвет"
                });
            }
        } else {
            if(isZinc) {
                validationResult.errors.push({
                    type: "param_not_correct", 
                    param: "prod_color",
                    message: "Для цинка не надо указывать цвет"
                });
            }
        }

        // Проверяем остальные параметры по правилам
        $.each(validationRules, function(index, rule) {
            switch(rule.type) {
                case "str":
                    if(element.attrs[rule.name].toString() === "") {
                        validationResult.errors.push({
                            type: "param_empty",
                            param: rule.name,
                            message: rule.message
                        });
                    }
                    break;

                case "int_ceil":
                    if(element.attrs[rule.name].toString() === "") {
                        validationResult.errors.push({
                            type: "param_empty",
                            param: rule.name,
                            message: rule.message
                        });
                    } else {
                        var value = parseInt(element.attrs[rule.name]);
                        if(value === 0 || isNaN(value)) {
                            validationResult.errors.push({
                                type: "param_zero",
                                param: rule.name,
                                message: rule.message_zero
                            });
                        } else if(parseFloat(element.attrs[rule.name]) % 1 > 0) {
                            validationResult.errors.push({
                                type: "param_precision",
                                precision: "1",
                                param: rule.name,
                                message: rule.message_precision
                            });
                        }
                    }
                    break;
                default:
            }
        });

        // Проверяем общую развертку
        totalLength = ps(element, true, "pline_lengths_ish");
        totalLength = parseFloat(totalLength.toFixed(3));

        if(totalLength % 1 > 0) {
            validationResult.errors.push({
                type: "razvertka_precision",
                precision: 1,
                message: "Общая развёртка (с завальцовкой) должна быть кратна 1 мм"
            });
        }

        return validationResult;
    }

    function zs(e) {
        var t = {
                lengths: [],
                angles: [],
                pline_start: "",
                pline_start_val: 0,
                pline_end: "",
                pline_end_val: 0,
                side_okras: "",
                pline_breaks: {},
                texts: []
            },
            _ = Bi.findOne("#" + e),
            a = _.points(),
            r = a.length,
            n = 0,
            s = 0;
        t.lengths = _.attrs.pline_lengths_ish, t.pline_breaks = JSON.copy(_.attrs.pline_breaks);
        for (var o = 0; o < (r - 2) / 2; o++) s = calculateAngle(a[2 * n + 0], -1e3, a[2 * n + 0], a[2 * n + 1], a[2 * n + 2], a[2 * n + 3], !0, !0, !1), isNaN(s) && (s = 0), s = parseFloat(s.toFixed(2)), t.angles.push(s), $.each(["pline_start", "pline_start_val", "pline_end", "pline_end_val", "side_okras"], function(e, a) {
            t[a] = _.attrs[a]
        }), $.each(["pline_start", "pline_end", "side_okras"], function(e, _) {
            "empty" == t[_] && (t[_] = "")
        }), n++;
        var l = Ct({
            filter_type: ["text"]
        });
        return $.each(l, function(e, _) {
            t.texts.push({
                name: _.name,
                text: _.text,
                is_visible: _.is_visible,
                x: _.x0_length,
                y: _.y0_length
            })
        }), t
    }

    function js() {
        if (0 == b_()) var e = to[vo].toImage({
            callback: function(e) {
                $("#modal_save_appendblock").html(e), showModalWindow("save", {})
            }
        });
        else {
            uo = {};
            var e = to[vo].toImage({
                callback: function(e) {
                    uo.tab_img_src = e.src, uo.tab_region = Ee(vo, !1, !0, !0, !0), K("nde_as_modal_cropped_image", {
                        image: uo
                    })
                }
            })
        }
    }

    function Cs(e) {
        $("#modal_save_appendblock").html("<img src=\"" + e.base64_croped + "\">"), showModalWindow("save", {})
    }

    function Ls() {
        var e = "",
            t = 0,
            _ = {},
            a;
        if ($.each(to[vo].children, function(_, a) {
                "Line" == a.className && "undefined" != typeof a.attrs.side_okras && (e = a.id(), t++)
            }), 1 == t) {
            Yn({
                text: "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u0448\u0430\u0431\u043B\u043E\u043D\u0430...",
                type: "wait"
            }), a = co.arrow[vo].attrs.visible, a && co.arrow[vo].hide(), $s[vo].hide(), Zs[vo].hide();
            var r = [],
                n = Ct({
                    filter_type: ["text"],
                    filter_visible: "1"
                }),
                s;
            $.each(n, function(e, t) {
                r.push(t.id), s = Bi.findOne("#" + t.id), s.hide()
            }), to[vo].draw(), uo = {};
            to[vo].toImage({
                callback: function(t) {
                    a && co.arrow[vo].show(), $s[vo].show(), Zs[vo].show(), $.each(r, function(e, t) {
                        s = Bi.findOne("#" + t), s.show()
                    }), to[vo].draw(), uo.tab_img_src = t.src, uo.tab_region = Ee(vo, !1, !1, !1, !1), _ = zs(e), K("nde_save_as_template", {
                        image: uo,
                        nde_params: _
                    })
                }
            })
        } else 0 == t ? Yn({
            text: "\u042D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E",
            type: "error"
        }) : Yn({
            text: "\u041D\u0430\u0439\u0434\u0435\u043D\u043E \u0431\u043E\u043B\u044C\u0448\u0435 \u043E\u0434\u043D\u043E\u0433\u043E \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
            type: "error"
        })
    }

    function Os(e) {
        Yn({
            text: "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0448\u0430\u0431\u043B\u043E\u043D\u0430...",
            type: "wait"
        }), K("nde_template_remove", {
            id: e.id
        })
    }

    function Fs(e) {
        var t = !1;
        $.each(e.texts, function(e, _) {
            t = !0, $("#d_elements_button_text").trigger("click"), incrementCounter(), incrementElementCounter("text");
            var a = new Konva.Text({
                x: _.x * Go.g_scale[vo] / 100 + Fo[vo],
                y: Ao[vo] - _.y * Go.g_scale[vo] / 100,
                text: _.text,
                fontSize: 18,
                fontFamily: "Arial",
                fill: mainColors.selected_element_color,
                id: "text__" + xo,
                name: _.name,
                draggable: !1,
                visible: !(1 != _.is_visible),
                is_object_visible: _.is_visible
            });
            a.on("click", function(e) {
                handleElementClick(e, "text")
            }), a.on("mousemove", function(e) {
                handleMouseMove(e)
            }), j(a), 0 == _.is_visible && al.find("[data-obj-id=\"" + a.id() + "\"]").parent().find(".fa").removeClass("fa-eye").addClass("fa-eye-slash")
        }), t && $("#d_elements_button_select").trigger("click")
    }

    function As(e, t) {
        var _ = !1;
        if (e = parseInt(e), 0 == e) _ = !0;
        else {
            var a = Bi.findOne("#" + t);
            if ("undefined" !== a) {
                var r = a.points(),
                    n = r.length / 2 - 1;
                e == n - 1 && (_ = !0)
            }
        }
        return _
    }

    function qs(e, t) {
        var _ = !1;
        return (0 == e || e == t / 2 - 1 - 1) && (_ = !0), _
    }

    // Создание объекта

    var Ts = "https://cad2.simplecad.ru/",
        Ss = "https://client.simplecad.ru/",
        Ps = "http://glm-test.metallist.g310/"; - 1 < window.location.href.indexOf(".g310") && (Ts = "https://testcad2.simplecad.ru/", Ss = Ps), -1 < window.location.href.indexOf(".loc") && (Ts = "https://cad.simplecad.loc/", Ss = Ps);
    var Is = Ts + "image/",
        Ys = Ts + "theme/image/",
        Ds = Ts + "ajax/",
        Xs = window.location.origin + "/calculate/roof/",
        Gs = {},
        Ws = {},
        Ks = {},
        Ns = {},
        Vs = {},
        $s = {},
        Es = {},
        Ms = {},
        Rs = {},
        Hs = {},
        Bs = {},
        Zs = {},
        Js = !1,
        Qs = !0,
        Us = !0,
        mainColors = {
            selected_element_color: "#000",
            default_element_color: "#000",
            sight_color: "#db4629",
            sight_orto_highlighted_color: "#4caf50",
            lineblock_color: "#ffff00",
            sheet_color: "#000",
            mouse_select_rect_color: "#db4629",
            segment_highlighter_hover: "#ff0000",
            regard_axis_highlighter: "#ff0000",
            orto_axis_highlighter: "#ec0000",
            move_point_default: "#ff0000",
            move_point_default_hover: "#ffd51a",
            move_point_current_pult: "#238cf9",
            move_point_current_pult_hover: "#95c9ff",
            grid_color: "#eee",
        },
        to = {},
        _o = {},
        ao = !0,
        ro = {},
        no = {},
        so = {},
        oo = {},
        io = {},
        lo = {
            x: !1,
            y: !1
        },
        co = {
            arrow: {}
        },
        po = {
            hor1: {},
            hor2: {},
            hor3: {},
            ver1: {},
            ver2: {},
            ver3: {},
            ver4: {},
            ver5: {},
            ver6: {},
            ver7: {},
            h1: {},
            h2: {},
            h3: {},
            h4: {},
            h5: {},
            h6: {},
            r1v1: {},
            r1v2: {},
            r1v3: {},
            r1v4: {},
            r1v5: {},
            r1v6: {}
        },
        mo = {"errors":[],"update_html":[],"append_html":[],"hide_html":[],"error_ids":[],"update_value":[],"success_js_action":"","data":{"color":["Almond Wood Fresh","Antique Wood","Antique Wood TwinColor","Cherry Wood","Cherry Wood Dark F","Cherry Wood Dark FTC","Cherry Wood Fresh","Cherry Wood Fresh TwinColor","Cherry Wood TwinColor","Chestnut Wood","Choco Wood TwinColor","Coffee Wood Blesk TwinColor","Coffee Wood TwinColor","Fine Stone TwinColor","Golden Wood","Golden Wood Fresh","Golden Wood Fresh TwinColor","Golden Wood Intense F","Golden Wood Intense FTC","Golden Wood TwinColor","Grey","Grey Wood TwinColor","Honey Wood TwinColor","King Stone TwinColor","Milky Wood TwinColor","NL 805","Nordic Wood TwinColor","Nutwood","Pine Wood Fresh","RAL 1014","RAL 1015","RAL 1018","RAL 2004","RAL 3003","RAL 3005","RAL 3009","RAL 3011","RAL 5002","RAL 5005","RAL 5021","RAL 6002","RAL 6005","RAL 7004","RAL 7005","RAL 7016","RAL 7024","RAL 8004","RAL 8017","RAL 9003","RAL 9005","RAL 9006","Rowan Fresh TwinColor","Rowan TwinColor","Rowan Wood Intense FTC","RR 11","RR 21","RR 23","RR 32","RR 5J3","RR 887","Sand Stone TwinColor","Snow Wood TwinColor","White Wood TwinColor"],"cover":["Atlas X","Drap","Drap ST","Drap TR","Drap TR lite","Drap TwinColor","Drap TX","Drap-double TX","GreenCoat Pural BT","GreenCoat Pural BT, matt","Print Elite","Print Premium","Print-double Elite","Print-double Premium","PurLite Matt","PurPro","PurPro Matt","Quarzit lite","Quarzit matt","Quarzit PRO Matt","Rooftop \u0411\u0430\u0440\u0445\u0430\u0442","Safari","Satin","Satin Matt","Satin Matt TX","Velur","Velur X","Velur20","\u0410\u043b\u044e\u0446\u0438\u043d\u043a","\u041f\u043e\u043b\u0438\u044d\u0441\u0442\u0435\u0440","\u041f\u043e\u043b\u0438\u044d\u0441\u0442\u0435\u0440 - double","\u041f\u043e\u043b\u0438\u044d\u0441\u0442\u0435\u0440 lite","\u041f\u043e\u043b\u0438\u044d\u0441\u0442\u0435\u0440 \u043c\u0430\u0442\u043e\u0432\u044b\u0439 - double","\u0426\u0438\u043d\u043a"],"thickness":["0.3","0.35","0.4","0.45","0.5","0.55","0.7","0.8","0.9"],"size":[2000,3000]},"exec_time":{"all_ajax":0.0524},"set_form_id":"","location_blank":"","set_attr":[],"remove_html":[],"notifications":[]}.data,
        ho = !1,
        uo = {},
        fo = {},
        go = {},
        yo = -1,
        bo = -1,
        vo = "",
        xo = 1e5,
        wo = {},
        ko = 1,
        zo = 1,
        jo = 1,
        Co = {
            roof_remove_question: null,
            autosave: null
        },
        Lo = {
            is_controller_visible: !1,
            parent_id: "",
            point_num: -1
        },
        Oo = {
            mode: "default",
            "data-element": "default",
            arrow_submode: "default"
        },
        Fo = {},
        Ao = {},
        qo = {},
        To = {},
        So = {
            x_offset: 0,
            y_offset: 0
        },
        Po = !1,
        Io = 0,
        Yo = 0,
        Do = !1,
        Xo = {
            is_active: !1,
            x_start: 0,
            y_start: 0,
            slope: {
                columns_sheets: [],
                id: "",
                overalls: {},
                start_point: {}
            }
        },
        Go = {
            g_scale: {}
        },
        Wo = {
            settings_programm_sheet_tabs: {
                name_mode: 0
            },
            settings_programm_figures_razmer: {
                is_use_razmer_template: 0,
                razmer_template: "0.000"
            },
            settings_programm_autosave: {
                is_use_autosave: 1,
                autosave_interval: 3
            }
        },
        Ko = !1,
        No = !0,
        Vo = !0,
        $o = !1,
        Eo = "to_axis",
        Mo = {},
        Ro = -1,
        Ho = {},
        Bo = "",
        Zo = {
            modal_linestartend: {
                values: {
                    empty: {
                        title: "\u041F\u0443\u0441\u0442\u043E"
                    },
                    zavalc_in: {
                        title: "\u0417\u0430\u0432\u0430\u043B\u044C\u0446\u043E\u0432\u043A\u0430 180\xB0"
                    },
                    zavalc_out: {
                        title: "\u0417\u0430\u0432\u0430\u043B\u044C\u0446\u043E\u0432\u043A\u0430 -180\xB0"
                    }
                }
            },
            modal_lineblock_type: {
                values: {
                    lineblock_vorota_rasp_36: {
                        title: "\u0412\u043E\u0440\u043E\u0442\u0430 \u0440\u0430\u0441\u043F\u0430\u0448\u043D\u044B\u0435 3,6 \u043C.",
                        set_lineblock_length_on_change: "3.6",
                        set_lineblock_length_readonly: !0
                    },
                    lineblock_vorota_rasp_35: {
                        title: "\u0412\u043E\u0440\u043E\u0442\u0430 \u043E\u0442\u043A\u0430\u0442\u043D\u044B\u0435 3,5 \u043C.",
                        set_lineblock_length_on_change: "3.5",
                        set_lineblock_length_readonly: !0
                    },
                    lineblock_vorota_otkat_45: {
                        title: "\u0412\u043E\u0440\u043E\u0442\u0430 \u043E\u0442\u043A\u0430\u0442\u043D\u044B\u0435 4,5 \u043C.",
                        set_lineblock_length_on_change: "4.5",
                        set_lineblock_length_readonly: !0
                    },
                    lineblock_kalitka_1m: {
                        title: "\u041A\u0430\u043B\u0438\u0442\u043A\u0430 1 \u043C.",
                        set_lineblock_length_on_change: "1",
                        set_lineblock_length_readonly: !0
                    },
                    lineblock_other: {
                        title: "\u0414\u0440\u0443\u0433\u043E\u0435",
                        set_lineblock_length_on_change: "2",
                        set_lineblock_length_readonly: !1
                    }
                }
            }
        },
        Jo = "<div class=\"row\"><div class=\"col-xs-12\"><img src=\"" + Ys + "online/bloueloading_3.gif\" class=\"center-block\"></div></div>",
        Qo = {
            btn_finish_cad_draw: !1
        },
        Uo = !0,
        ei = {},
        ti = {
            id: 0,
            name: "",
            type: ""
        },
        _i = {
            is_canvas_image_mouse_wheel: {
                default: !0,
                glzabor: !0,
                sznde: !0,
                roof: !0
            },
            g_scale: {
                default: 200,
                glzabor: 1200,
                sznde: 250,
                roof: 1e4
            },
            draw_grid_mult: {
                default: 1,
                glzabor: 1,
                sznde: 10,
                roof: 1
            },
            object_add_layer_row__pline: {
                default: "\u041F\u043E\u043B\u0438\u043B\u0438\u043D\u0438\u044F",
                glzabor: "\u0417\u0430\u0431\u043E\u0440",
                sznde: "\u042D\u043B\u0435\u043C\u0435\u043D\u0442",
                roof: "\u041F\u043E\u043B\u0438\u043B\u0438\u043D\u0438\u044F"
            },
            all_pline_length_as_perimetr: {
                default: "\u0414\u043B\u0438\u043D\u0430",
                glzabor: "\u041F\u0435\u0440\u0438\u043C\u0435\u0442\u0440",
                sznde: "\u0414\u043B\u0438\u043D\u0430",
                roof: "\u0414\u043B\u0438\u043D\u0430"
            },
            is_show_line_start_end_type_in_obj_tbl: {
                default: !0,
                glzabor: !1,
                sznde: !0,
                roof: !0
            },
            table_build_element_length_text_line: {
                default: "\u0414\u043B\u0438\u043D\u0430",
                glzabor: "\u0421\u0442\u043E\u0440\u043E\u043D\u0430",
                sznde: "\u0414\u043B\u0438\u043D\u0430",
                roof: "\u0414\u043B\u0438\u043D\u0430"
            },
            table_build_element_length_text_pline: {
                default: "\u0414\u043B\u0438\u043D\u0430",
                glzabor: "\u0421\u0442\u043E\u0440\u043E\u043D\u0430",
                sznde: "\u0414\u043B\u0438\u043D\u0430",
                roof: "\u0414\u043B\u0438\u043D\u0430"
            },
            table_build_element_length_text_arrow: {
                default: "\u0414\u043B\u0438\u043D\u0430",
                glzabor: "\u0414\u043B\u0438\u043D\u0430",
                sznde: "\u0414\u043B\u0438\u043D\u0430",
                roof: "\u0414\u043B\u0438\u043D\u0430"
            },
            table_build_element_length_readonly: {
                default: !1,
                glzabor: !1,
                sznde: !0,
                roof: !0
            },
            table_build_element_angle_readonly: {
                default: !1,
                glzabor: !1,
                sznde: !0,
                roof: !0
            },
            size_text_is_line_counter: {
                default: !0,
                glzabor: !0,
                sznde: !1,
                roof: !0
            },
            size_is_vynos: {
                default: !0,
                glzabor: !0,
                sznde: !1,
                roof: !1
            },
            size_is_push_to_line: {
                default: !1,
                glzabor: !1,
                sznde: !0,
                roof: !1
            },
            draggable_konva_text_angle: {
                default: !1,
                glzabor: !1,
                sznde: !0,
                roof: !1
            },
            listening_konva_text_angle: {
                default: !1,
                glzabor: !1,
                sznde: !0,
                roof: !1
            },
            draggable_konva_text_line_length: {
                default: !1,
                glzabor: !1,
                sznde: !0,
                roof: !1
            },
            listening_konva_text_line_length: {
                default: !1,
                glzabor: !1,
                sznde: !0,
                roof: !1
            },
            default_params_x_offset: {
                default: .1,
                glzabor: .1,
                sznde: .08,
                roof: .1
            },
            default_params_y_offset: {
                default: .9,
                glzabor: .9,
                sznde: .8,
                roof: .9
            }
        },
        ai = {
            errors: [],
            error_ids: []
        },
        ri = {
            errors: [],
            error_ids: []
        },
        ni = {
            roof_data_full: {},
            sheets_filtered_sorted_grouped: [],
            tabs_filtered: [],
            pdf_attach_file_name: "",
            png_attach_files_name: []
        },
        si = "",
        oi = {},
        ii = {},
        li = [],
        ci = -1,
        di = {},
        pi = !1,
        mi = !1,
        hi = {},
        ui = {},
        fi = {},
        gi = {},
        l = {
            "pi/180": Math.PI / 180,
            "180/pi": 180 / Math.PI
        },
        yi = {
            length: {
                prec: 3,
                str: "0.000"
            }
        },
        bi = "",
        vi = {},
        xi = {},
        wi = -1,
        ki = -1,
        zi = "",
        ji = "",
        Ci = [],
        Li = [],
        Oi = {},
        Fi = !0,
        Ai = !0,
        qi = "",
        Ti = [],
        Si = [],
        Pi = [],
        Ii = [],
        Yi = 0,
        Di = {
            positions: [],
            sizes: []
        },
        Xi = 0,
        Gi = 0,
        Wi = 0,
        Ki = [],
        Ni = {
            do_equal_stat: !1
        },
        Vi = "",
        $i = !1,
        Ei = [20, 30, 40, 50, 60, 70, 80],
        Mi = {
            pline_segment_highlight_set_length_footer: {
                buttons: [{
                    html: "<button type=\"button\" class=\"btn btn-success\"  onclick=\"SimpleCad.Action({'type':'pline_segment_highlight_set_length_submit'});\">\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C <span class=\"btn_enter_text\">(Enter)</span></button>"
                }, {
                    type: "close"
                }]
            },
            roof_menu_edit_sheet_rename_footer: {
                buttons: [{
                    html: "<button type=\"button\" class=\"btn btn-success\"  onclick=\"SimpleCad.Action({'type':'roof_menu_edit_sheet_rename_submit'});\">\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C <span class=\"btn_enter_text\">(Enter)</span></button>"
                }, {
                    type: "close"
                }]
            }
        },
        Ri = {
            inputs: {
                accessories_size_roof_s: {
                    type: "float",
                    precision: 2,
                    value: 0,
                    input_type: "input"
                },
                accessories_size_konek: {
                    type: "float",
                    precision: 2,
                    value: 0,
                    input_type: "input"
                },
                accessories_size_konek_odnoskatn: {
                    type: "float",
                    precision: 2,
                    value: 0,
                    input_type: "input"
                },
                accessories_size_karnizy: {
                    type: "float",
                    precision: 2,
                    value: 0,
                    input_type: "input"
                },
                accessories_size_fronton: {
                    type: "float",
                    precision: 2,
                    value: 0,
                    input_type: "input"
                },
                accessories_size_primyk_verhn: {
                    type: "float",
                    precision: 2,
                    value: 0,
                    input_type: "input"
                },
                accessories_size_endova: {
                    type: "float",
                    precision: 2,
                    value: 0,
                    input_type: "input"
                },
                accessories_size_izlom_vneshn: {
                    type: "float",
                    precision: 2,
                    value: 0,
                    input_type: "input"
                },
                accessories_size_izlom_vnutr: {
                    type: "float",
                    precision: 2,
                    value: 0,
                    input_type: "input"
                },
                accessories_size_uteplenie_tolsh: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "select"
                },
                accessories_zaglush_k_polukrugl_konku_torcevaya: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_zaglush_k_polukrugl_konku_konusnaya: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_troynik_y_obr_polukrugl_konek: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_chetvernik_polukrugl_konek: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_planka_torcevaya_segm_right: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_planka_torcevaya_segm_left: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_planka_torcevaya_segm_start_right: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_planka_torcevaya_segm_start_left: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_planka_torcevaya_strahovochn: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_modul_obhoda_truby: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_sneg_3m: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_sneg_1m: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_perehodny_mostik: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_lestnica_kroveln: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_lestnica_stenovaya: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_ograjd_kroveln_3m: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_korrektor_carap: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_lestnica_cherdachn: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_kojuh_truby: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_dymnik: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_oklada_truby: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_modul_obhoda: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_kreplenie_vodostoka_dlinnoe_metall_pvh: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_prohodnoy_element: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_vent_vyhod_kanaliz: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_prohodnoy_element_master_flash: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_stepler_skob_41407: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_nasadka_magnit_845_848: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                },
                accessories_nasadka_stal_bober: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input"
                }
            },
            res: {
                res_accessories_konek_polukrugl_197: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_konek_figurn: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_konek_plosk: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_konek_odnoskat: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_planka_primyk: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_planka_primyk_vnakl: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_endova_nizn: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_endova_figurn_verhn: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_endova_verhn: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_planka_karniznaya: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_planka_torcevaya: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_planka_kapelnik: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_samorezy_4219: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_samorezy_4829_krovla: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_samorezy_4829_doborn: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_samorezy_4819: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_rezin_uplotnitel: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_uplotnitel_univers_s_kleem_3050: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_uplotnit_lenta_pod_kontrobr: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_lenta_germetiz_stykov: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_aeroelement_konka_gl_5m: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_lenta_ventil_gl_1005000: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_membrana_superdiff: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_plenka_paroizol: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_uteplitel: {
                    type: "float",
                    precision: 2,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_brus_profil: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_odnostor_dvustor_soedinit_lenta: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_germetik: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_lenta_primyk_gofr_alum_gl: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_rolik_prikatochn: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_samorezy_pz_ocink_uvelich_stoykost: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_kroveln_ventil: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_pistolet_germetik: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                },
                res_accessories_skoby_stepler: {
                    type: "int",
                    precision: 0,
                    value: 0,
                    input_type: "input",
                    is_set: 0
                }
            }
        },
        Hi = {
            pline_segment_highlight_set_length_form: {
                inputs: {
                    pline_segment_highlight_set_length_length: {
                        label: "\u0414\u043B\u0438\u043D\u0430 \u0441\u0442\u043E\u0440\u043E\u043D\u044B",
                        is_more_zero: !0,
                        onkeyup: "SimpleCad.Action({'type':'FormInputKeyup','eventObject':event,'thisObject':$(this)})"
                    },
                    pline_segment_highlight_set_length_nosubmit: {
                        is_nosubmit: !0
                    }
                }
            },
            roof_menu_edit_sheet_rename_form: {
                inputs: {
                    roof_menu_edit_sheet_rename_name: {
                        label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0432\u043A\u043B\u0430\u0434\u043A\u0438",
                        onkeyup: "SimpleCad.Action({'type':'FormInputKeyup','eventObject':event,'thisObject':$(this)})"
                    },
                    roof_menu_edit_sheet_rename_nosubmit: {
                        is_nosubmit: !0
                    }
                }
            },
            roof_new_form: {
                inputs: {
                    roof_new_name: {
                        label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0440\u0430\u0441\u0447\u0451\u0442\u0430"
                    },
                    roof_new_gap_y: {
                        label: "\u041F\u0435\u0440\u0435\u043A\u0440\u044B\u0442\u0438\u0435 \u0437\u0430\u043C\u043A\u043E\u0432\u043E\u0435",
                        is_check_as_int: !0,
                        is_more_zero: !0,
                        is_more_equal_zero: !1,
                        is_more_equal_zero_message: "<b>\u041D\u0430\u0445\u043B\u0451\u0441\u0442</b> \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u0435\u043D \u043D\u0443\u043B\u044E."
                    },
                    roof_new_sheet_width_useful: {
                        label: "\u0428\u0438\u0440\u0438\u043D\u0430 \u043B\u0438\u0441\u0442\u0430 \u043F\u043E\u043B\u0435\u0437\u043D\u0430\u044F",
                        is_check_as_int: !0,
                        is_more_zero: !0
                    },
                    roof_new_sheet_allowed_length_rounding: {
                        label: "\u041E\u043A\u0440\u0443\u0433\u043B\u0435\u043D\u0438\u0435 \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0445 \u0440\u0430\u0437\u043C\u0435\u0440\u043E\u0432",
                        is_check_as_int: !0,
                        is_more_zero: !0
                    },
                    roof_new_offset_run: {
                        label: "\u0420\u0430\u0437\u0431\u0435\u0436\u043A\u0430",
                        is_check_as_int: !0,
                        is_more_zero: !0,
                        is_more_zero_message: "<b>\u0420\u0430\u0437\u0431\u0435\u0436\u043A\u0430</b> \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0443\u043B\u044F.",
                        is_more_zero_if_id_visible: "roof_new_offset_run"
                    },
                    roof_new_chess_offset: {
                        label: "\u0428\u0430\u0445\u043C\u0430\u0442\u043D\u0430\u044F \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u0430",
                        is_check_as_int: !0
                    },
                    roof_new_sheet_allowed_length_correct_min: {
                        label: "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0434\u043B\u0438\u043D\u0430",
                        is_check_as_int: !0
                    },
                    roof_new_sheet_allowed_length_correct_max: {
                        label: "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0434\u043B\u0438\u043D\u0430",
                        is_check_as_int: !0,
                        is_more_zero: !0
                    }
                }
            },
            target_rect_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {}
                }
            },
            target_triangle_form: {
                inputs: {
                    a: {
                        is_more_zero: !0
                    },
                    b: {
                        is_more_zero: !0
                    },
                    c: {
                        is_more_zero: !0
                    },
                    h: {
                        is_more_zero: !0
                    },
                    a1: {
                        is_more_zero: !1
                    }
                }
            },
            target_triangle_2_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {}
                }
            },
            target_triangle_3_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {}
                }
            },
            target_triangle_4_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {}
                }
            },
            target_triangle_5_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {}
                }
            },
            target_trapec_form: {
                is_more_zero_all: !0,
                inputs: {
                    h: {},
                    a1: {},
                    a: {},
                    b: {},
                    c: {},
                    d: {}
                }
            },
            target_paragramm_form: {
                is_more_zero_all: !0,
                inputs: {
                    h: {},
                    a: {},
                    b: {},
                    c: {},
                    d: {}
                }
            },
            target_trapec_2_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {}
                }
            },
            target_trapec_6_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {}
                }
            },
            target_trapec_7_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {}
                }
            },
            target_trapec_8_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {}
                }
            },
            target_gun_3_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    f: {}
                }
            },
            target_air_ex_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {}
                }
            },
            target_porch_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    f: {},
                    g: {},
                    h: {}
                }
            },
            target_home_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    h: {},
                    c: {},
                    d: {},
                    e: {}
                }
            },
            target_home_2_form: {
                is_more_zero_all: !0,
                inputs: {
                    h: {},
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    f: {}
                }
            },
            target_hill_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {}
                }
            },
            target_nest_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    f: {},
                    g: {},
                    h: {}
                }
            },
            target_nest_2_form: {
                is_more_zero_all: !0,
                inputs: {
                    h: {},
                    a1: {},
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    l: {},
                    f: {},
                    g: {}
                }
            },
            target_corner_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {}
                }
            },
            target_trapec_3_form: {
                is_more_zero_all: !0,
                inputs: {
                    h: {},
                    a1: {},
                    a: {},
                    b: {},
                    c: {},
                    d: {}
                }
            },
            target_hill_2_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    f: {}
                }
            },
            target_corner_2_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {}
                }
            },
            target_gun_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {}
                }
            },
            target_gun_2_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {}
                }
            },
            target_goose_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {}
                }
            },
            target_home_4_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    h: {},
                    h1: {},
                    a1: {}
                }
            },
            target_nest_3_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    h: {}
                }
            },
            target_hill_3_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    L: {},
                    L1: {},
                    L2: {},
                    h1: {},
                    h2: {}
                }
            },
            target_hill_4_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    L: {},
                    L1: {},
                    L2: {},
                    h1: {},
                    h2: {}
                }
            },
            target_nest_4_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    a1: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    f: {},
                    g: {},
                    h: {},
                    i: {},
                    j: {},
                    L: {},
                    L1: {},
                    a2: {}
                }
            },
            target_home_3_form: {
                is_more_zero_all: !0,
                inputs: {
                    H: {},
                    L: {},
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    f: {},
                    g: {}
                }
            },
            target_horn_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    h: {},
                    h1: {}
                }
            },
            target_vase_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    h: {},
                    h1: {}
                }
            },
            target_trapec_4_form: {
                inputs: {
                    h: {
                        is_more_zero: !0
                    },
                    h1: {
                        is_more_zero: !0
                    },
                    a: {
                        is_more_zero: !0
                    },
                    a1: {
                        is_more_zero: !0
                    },
                    b: {
                        is_more_zero: !0
                    },
                    c: {
                        is_more_zero: !1
                    },
                    d: {
                        is_more_zero: !0
                    },
                    e: {
                        is_more_zero: !0
                    },
                    e1: {
                        is_more_zero: !0
                    },
                    f: {
                        is_more_zero: !0
                    }
                }
            },
            target_trapec_5_form: {
                inputs: {
                    h: {
                        is_more_zero: !0
                    },
                    h1: {
                        is_more_zero: !0
                    },
                    a: {
                        is_more_zero: !0
                    },
                    a1: {
                        is_more_zero: !0
                    },
                    b: {
                        is_more_zero: !0
                    },
                    c: {
                        is_more_zero: !0
                    },
                    c1: {
                        is_more_zero: !0
                    },
                    d: {
                        is_more_zero: !0
                    },
                    e: {
                        is_more_zero: !1
                    },
                    f: {
                        is_more_zero: !0
                    }
                }
            },
            target_train_1_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    f: {}
                }
            },
            target_train_2_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    f: {}
                }
            },
            target_paragramm_2_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    h: {}
                }
            },
            target_paragramm_3_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    h: {}
                }
            },
            target_wigwam_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    f: {},
                    g: {},
                    h: {},
                    h1: {},
                    h2: {}
                }
            },
            target_tank_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    a1: {},
                    a2: {},
                    a3: {},
                    h1: {},
                    h2: {}
                }
            },
            target_tank_2_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    a1: {},
                    a2: {},
                    a3: {},
                    h1: {},
                    h2: {}
                }
            },
            target_ftable_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    f: {},
                    g: {},
                    h: {}
                }
            },
            target_hill_5_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    f: {},
                    g: {},
                    h1: {},
                    h2: {},
                    h3: {},
                    L1: {},
                    L2: {}
                }
            },
            target_hill_6_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    h1: {},
                    h2: {},
                    L: {},
                    L1: {}
                }
            },
            target_nest_5_form: {
                is_more_zero_all: !0,
                inputs: {
                    a: {},
                    b: {},
                    c: {},
                    d: {},
                    e: {},
                    f: {},
                    g: {},
                    h: {},
                    i: {},
                    j: {},
                    L1: {}
                }
            }
        },
        Bi, Zi, Ji, Qi, Ui, el, tl, _l, al, rl, nl, sl, ol, il, ll, cl, dl, pl, ml, hl, ul, fl, gl, yl, bl, vl, xl, wl, kl, zl, jl, Cl, Ll, Ol, isRotateClick, $magnet30, $rotate;
    this.Start = function(t) {
        initializeCadBlock(t)
    }, SimpleCad.Action = function(_) {
        switch (_.type) {
            case "tree_show":
                Bn();
                break;
            case "tree_hide":
                Zn();
                break;
            case "tree_item_click":
                Jn(_);
                break;
            case "tree_table_nom_click":
                Un(_);
                break;
            case "files_table_search":
                Hn(_);
                break;
            case "roof_crossing_remove":
                Kn();
                break;
            case "cad_history":
                An(_);
                break;
            case "roof_settings_programm_save_tab":
                It(_.form);
                break;
            case "roof_settings_programm_set_tab":
                $("#ul_settings_programm").find(".active").removeClass("active");
                var r = _.thisObject;
                r.addClass("active"), $(".js_settings_programm_tab_content").hide(), $("[data-settings-programm-tab=\"" + _.target + "\"]").show();
                break;
            case "fullscreen_mode_toggle":
                $("#r_d_root").toggleClass("d_root_fullscreen_mode");
                break;
            case "roof_accessories_mch_pn_param_changed":
            case "roof_accessories_mch_pn_param_changed_for_formula":
                ln(_);
                break;
            case "accessories_second_modal":
                dn(_);
                break;
            case "accessories_save_as_pdf":
                pn(_);
                break;
            case "accessories_cell_calculated_edit_click":
                hn(_);
                break;
            case "accessories_cell_calculated_cancel_click":
                un(_);
                break;
            case "modal_img":
                var s = "";
                switch (_.thisObject[0].attributes["data-remote"].value) {
                    case "src":
                        s = _.thisObject[0].attributes.src.value;
                        break;
                    default:
                        s = _.thisObject[0].attributes["data-remote"].value;
                }
                showModalWindow(_.type, {
                    target: s
                });
                break;
            case "releasenotes_one":
                X(_.type, _.params);
                break;
            case "proektor_z_modal_hide":
                $("#proektor_z_modal").hide(), $("#proektor_z_modal_content").html("");
                break;
            case "cad_toggle_show_grid":
                Ko ? (Ko = !1, $.each(Ns, function(e, t) {
                    t.hide()
                }), to[vo].draw(), $("#nav_li_view_grid").find(".js_i_view_grid").removeClass("fa-check-square-o").addClass("fa-square-o"), $("#nav_li_view_grid_context").find(".js_i_view_grid").removeClass("fa-check-square-o").addClass("fa-square-o"), $("#cad_toggle_show_grid_nav_right").removeClass("nav_roof_icon_show_grid_mode_show").addClass("nav_roof_icon_show_grid_mode_hide")) : (Ko = !0, $.each(Ns, function(e, t) {
                    t.show()
                }), to[vo].draw(), $("#nav_li_view_grid").find(".js_i_view_grid").removeClass("fa-square-o").addClass("fa-check-square-o"), $("#nav_li_view_grid_context").find(".js_i_view_grid").removeClass("fa-square-o").addClass("fa-check-square-o"), $("#cad_toggle_show_grid_nav_right").removeClass("nav_roof_icon_show_grid_mode_hide").addClass("nav_roof_icon_show_grid_mode_show"));
                break;
            case "cad_toggle_show_axis":
                No ? (No = !1, $.each(Vs, function(e, t) {
                    t.hide()
                }), to[vo].draw(), $("#nav_li_view_axis").find(".js_i_view_axis").removeClass("fa-check-square-o").addClass("fa-square-o"), $("#nav_li_view_axis_context").find(".js_i_view_axis").removeClass("fa-check-square-o").addClass("fa-square-o")) : (No = !0, $.each(Vs, function(e, t) {
                    t.show()
                }), to[vo].draw(), $("#nav_li_view_axis").find(".js_i_view_axis").removeClass("fa-square-o").addClass("fa-check-square-o"), $("#nav_li_view_axis_context").find(".js_i_view_axis").removeClass("fa-square-o").addClass("fa-check-square-o"));
                break;
            case "cad_toggle_show_columns_sheets":
                Vo ? (Vo = !1, $.each(Bs, function(e, t) {
                    t.hide()
                }), to[vo].draw(), $("#nav_li_view_columns_sheets").find(".js_i_view_columns_sheets").removeClass("fa-check-square-o").addClass("fa-square-o"), $("#nav_li_view_columns_sheets_context").find(".js_i_view_columns_sheets").removeClass("fa-check-square-o").addClass("fa-square-o"), $("#cad_toggle_show_columns_sheets_nav_right").removeClass("nav_roof_icon_show_columns_sheets_mode_show").addClass("nav_roof_icon_show_columns_sheets_mode_hide")) : (Vo = !0, $.each(Bs, function(e, t) {
                    t.show()
                }), to[vo].draw(), $("#nav_li_view_columns_sheets").find(".js_i_view_columns_sheets").removeClass("fa-square-o").addClass("fa-check-square-o"), $("#nav_li_view_columns_sheets_context").find(".js_i_view_columns_sheets").removeClass("fa-square-o").addClass("fa-check-square-o"), $("#cad_toggle_show_columns_sheets_nav_right").removeClass("nav_roof_icon_show_columns_sheets_mode_hide").addClass("nav_roof_icon_show_columns_sheets_mode_show"));
                break;
            case "FormInputKeyup":
                var r = _.thisObject,
                    o = _.eventObject,
                    m = o.keyCode;
                if (13 == m) switch (r[0].attributes.id.value) {
                    case "pline_segment_highlight_set_length_length":
                        SimpleCad.Action({
                            type: "pline_segment_highlight_set_length_submit"
                        });
                        break;
                    case "roof_menu_edit_sheet_rename_name":
                        SimpleCad.Action({
                            type: "roof_menu_edit_sheet_rename_submit"
                        });
                        break;
                    case "roof_save_as_name":
                        SimpleCad.Action({
                            type: "roof_save_as"
                        });
                        break;
                    default:
                }
                break;
            case "rotate":
               
                // Если переменная `zi` пустая
                if ("" == zi) {
                    // Проверяем, есть ли тип `ei.type` в массиве ["sznde"]
                    if (-1 !== $.inArray(ei.type, ["sznde"])) {
                        gs(); // Выполняем функцию `gs`, если условие выполнено
                    }
                } else {
                    // Если `zi` не пустая, вызываем функцию `T` с параметрами
                    // T(zi, {
                    //     is_move_show: !1 // Устанавливаем флаг `is_move_show` в false
                    // });
                }

                if ("undefined" != typeof Zi && "undefined" !== Zi) {
                    rotateElement(Zi, _.angle, !0);
                    
                    if ("" == zi) {                        
                        if (-1 !== $.inArray(ei.type, ["sznde"])) {
                            resetCADState();
                            setDefaultMode();
                            Zi = "undefined";
                        }
                    } else {
                        se();
                        oe();
                        ce();
                        Zi.stroke("#ff8223");
                        Zi = "undefined";
                    }
                } else {
                    if (-1 === $.inArray(ei.type, ["sznde"])) {
                        console.log('zi not2')
                        SimpleCad.Action({
                            type: "ModalShow",
                            target: "rotate_btn_click_error"
                        });
                    } else {
                        Yn({
                            text: "Элементов не найдено",
                            type: "error"
                        });
                    }
                }
                break;
            case "mirror_hor":
                "" != zi && T(zi, {
                    is_move_show: !1
                }), "undefined" != typeof Zi && "undefined" !== Zi ? (Nr(Zi, !0), "" != zi && (se(), oe(), ce(), Zi.stroke("#ff8223"), Zi = "undefined")) : SimpleCad.Action({
                    type: "ModalShow",
                    target: "mirror_btn_click_error"
                });
                break;
            case "pline_segment_highlight_set_length_submit":
                if (Wt("pline_segment_highlight_set_length_form", ""), 0 < ai.errors.length) return;
                var h = U($("#pline_segment_highlight_set_length_length").val()),
                    u, f; - 1 !== $.inArray(ei.type, ["sznde"]) && (u = As(hi.segment_num, hi.parent[0].id()), f = u ? 10 : 17, h = Math.abs(h), h = Math.round_precision(h, 1), h < f && (h = f));
                var b = Math.round(1e3 * hi.segment_length) - Math.round(1e3 * h);
                if (b = U((b / 1e3).toFixed(yi.length.prec)), -1 !== $.inArray(ei.type, ["sznde"])) {
                    var v = !!(hi.nearest_point_num_in_pline > hi.farthest_point_num_in_pline);
                    an(hi.parent[0].id(), hi.segment_num, h, v), refreshCurrentLayer(), _n(hi.parent[0].id(), {
                        mode: "length_one",
                        num: hi.segment_num,
                        val: h
                    }), rs(hi.parent[0]), fs(hi.parent[0]), updateElementParametersDisplay(hi.parent[0]), refreshCurrentLayer()
                } else Zr(hi.parent[0], hi.nearest_point_num_in_pline, hi.farthest_point_num_in_pline, b), refreshCurrentLayer();
                $("#modal_html").modal("hide");
                break;
            case "roof_menu_edit_sheet_rename_submit":
                if (Wt("roof_menu_edit_sheet_rename_form", ""), 0 < ai.errors.length) return;
                rl.find("[data-layer-num=\"" + yo + "\"]").html($("#roof_menu_edit_sheet_rename_name").val()), $("#modal_html").modal("hide");
                break;
            case "roof_specification_full_project_pdf_link_png_list_btn_click":
                $("#roof_specification_full_project_pdf_link_png_list_value").toggle();
                break;
            case "roof_specification_full_project_pdf":
            case "roof_specification_full_project_pdf_and_demand":
                Ar();
                var x = $("#roof_specification_full_project_pdf_form").serializeArray();
                if (x = Nt(x), x = x.filter, ("undefined" == typeof x || "undefined" == x) && (x = []), 0 == x.length) return void $("#roof_specification_full_project_table_err_ul").html("<li><i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i> \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u043E\u0434\u0438\u043D \u0444\u043E\u0440\u043C\u0430\u0442 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F \u043A \u0437\u0430\u044F\u0432\u043A\u0435.</li>");
                if (SimpleCad.Action({
                        type: "roof_specification_full_project_pdf_remove"
                    }), qr(), Pr(), 0 == ni.tabs_filtered.length) return void $("#roof_specification_full_project_table_err_ul").html("<li><i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i> \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043D\u043E\u043C\u0435\u043D\u043A\u043B\u0430\u0442\u0443\u0440\u044B \u0434\u043B\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438.</li>");
                $("#roof_specification_full_project_pdf_btn").find(".table_cad_span_link_loading").show();
                var w = JSON.copy(Mo);
                w.sheet_allowed_length = [], w.sheet_allowed_length_full = [], K(_.type, {
                    tabs: ni.tabs_filtered,
                    sheets_filtered_sorted_grouped: ni.sheets_filtered_sorted_grouped,
                    roof_data_params: w,
                    warehouse_cutting: Di,
                    filters: x
                });
                break;
            case "roof_specification_full_project_pdf_remove":
                ("" != ni.pdf_attach_file_name || 0 < ni.png_attach_files_name.length) && K("roof_specification_full_project_pdf_remove", {
                    pdf_attach_file_name: ni.pdf_attach_file_name,
                    png_attach_files_name: ni.png_attach_files_name
                });
                break;
            case "roof_specification_full_project":
                showModalWindow(_.type, {});
                var k = S_("roof_specification_full_project");
                K(_.type, {
                    roof_data: k
                });
                break;
            case "roof_specification_full_project_demand":
                if (si = _.mode, $("#roof_specification_full_project_err_ul").html(""), $("#roof_specification_full_project_table_err_ul").html(""), $("#roof_specification_full_project_after_checkboxes_err_ul").html(""), $("#roof_specification_full_project_down_err_ul").html(""), $("#roof_specification_full_project_demand_link").html(""), $("#roof_specification_full_project_demand_animation").html(""), 0 == ni.sheets_filtered_sorted_grouped.length) {
                    var z = "<li><i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i> \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043D\u043E\u043C\u0435\u043D\u043A\u043B\u0430\u0442\u0443\u0440\u044B \u0434\u043B\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438.</li>";
                    return void $("#roof_specification_full_project_err_ul").html(z)
                }
                if ("demand_1c" == _.mode && "" == $("#roof_specification_full_project_employee_selected_id_1c").val() && !1) {
                    var z = "<li><i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i> \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E.</li>";
                    return void $("#roof_specification_full_project_err_ul").html(z)
                }
                var x = $("#roof_specification_full_project_pdf_form").serializeArray();
                x = Nt(x), x = x.filter, ("undefined" == typeof x || "undefined" == x) && (x = []), 0 == x.length, $("#roof_specification_full_project_demand_animation").html(Jo), $.each(ni.sheets_filtered_sorted_grouped, function(e) {
                    ni.sheets_filtered_sorted_grouped[e].code_1c = Mo.nom_code_1c, ni.sheets_filtered_sorted_grouped[e].id_1c = Mo.nom_id_1c
                }), 0 < x.length && "" == ni.pdf_attach_file_name && 0 == ni.png_attach_files_name.length ? SimpleCad.Action({
                    type: "roof_specification_full_project_pdf_and_demand"
                }) : K(_.type, {});
                break;
            case "roof_specification_full_project_employee_select_toggle":
                var j = _.thisObject.parent().parent();
                j.hasClass("opened") ? j.removeClass("opened") : (j.addClass("opened"), j.find(".form_div_like_select_bottom_inp_inp").focus());
                break;
            case "roof_specification_full_project_employee_reset":
                var j = _.thisObject.parent().parent().parent();
                j.find("#roof_specification_full_project_employee_selected_id_1c").val(""), j.find(".form_div_like_select_top_text_val").html(""), j.find(".form_div_like_select_bottom_inp_inp").val(""), j.find(".form_div_like_select_bottom_inp_inp").focus(), j.find(".form_div_like_select_bottom_inp_dropdown").html(""), j.find(".form_div_like_select_bottom_inp_dropdown").hide();
                break;
            case "roof_specification_full_project_employee_input":
                "" == _.thisObject.val() && SimpleCad.Action({
                    type: "roof_specification_full_project_employee_reset",
                    thisObject: _.thisObject
                });
                break;
            case "roof_specification_full_project_employee_keyup":
                var L = _.event_object.keyCode;
                13 == L && SimpleCad.Action({
                    type: "roof_specification_full_project_employee_search",
                    thisObject: _.thisObject
                });
                break;
            case "roof_specification_full_project_employee_blur":
                break;
            case "roof_specification_full_project_employee_search":
                var j = _.thisObject.parent().parent().parent(),
                    O = j.find(".form_div_like_select_bottom_inp_inp").val();
                "" == O ? SimpleCad.Action({
                    type: "roof_specification_full_project_employee_reset",
                    thisObject: _.thisObject
                }) : (j.find(".form_div_like_select_bottom_inp_dropdown").html("<div class=\"form_div_like_select_bottom_inp_dropdown_loading\"><img src=\"" + Ys + "online/bloueloading_3.gif\" class=\"center-block\"></div>"), j.find(".form_div_like_select_bottom_inp_dropdown").show(), K("roof_specification_full_project_employees", {
                    search_string: O
                }));
                break;
            case "roof_specification_full_project_employee_set":
                var j = _.thisObject.parent().parent().parent().parent().parent().parent();
                j.find("#roof_specification_full_project_employee_selected_id_1c").val(_.id_1c), j.find(".form_div_like_select_top_text_val").html(_.thisObject.html()), j.find(".form_div_like_select_top_text").trigger("click");
                break;
            case "checkbox":
                _r(_);
                break;
            case "roof_menu_edit_sheet_copy":
                if (!$("#nav_li_edit_tab_copy").hasClass("disabled")) {
                    var k = S_("roof_menu_edit_sheet_copy");
                    K(_.type, {
                        roof_data: k
                    })
                }
                break;
            case "roof_menu_edit_sheet_paste":
                $("#nav_li_edit_tab_paste").hasClass("disabled") || K(_.type, {});
                break;
            case "roof_menu_edit_sheet_mirror":
                Xr({
                    history: !0
                });
                break;
            case "roof_menu_edit_sheet_remove":
                d(yo, !0);
                break;
            case "roof_one_sheet_change":
                Z_(_);
                break;
            case "roof_new_nomenclature_change":
                if ("none" == $("#roof_new_form_create_btn").css("display"));
                else {
                    $("#roof_new_form_create_btn").hide(), $("#roof_new_form_set_settings").hide(), $("#roof_new_find_nomenclature_btn").show(), $("#roof_new_nomenclature_params").html("");
                    var A = $("#settings_programm_new_project_is_use_name_template").html();
                    if (A = parseInt(A), 1 == A) {
                        var S = $("#settings_programm_new_project_name_template").html(),
                            P = $("#roof_new_name").val(),
                            I = P.indexOf("[["),
                            Y = P.indexOf("]]");
                        if (-1 < I && -1 < Y) {
                            var D = P.substr(I + 2, Y - I - 2);
                            P = P.replace(D, S), $("#roof_new_name").val(P)
                        }
                    }
                }
                break;
            case "roof_new_nomenclature_change_2":
                if ("none" == $("#roof_new_find_nomenclature_btn").css("display") && $("#roof_new_form_set_settings").show(), "undefined" != typeof _.element) switch (_.element) {
                    case "roof_new_type_reassign":
                        "siding_vert" == $("#roof_new_type_reassign").val() ? $("#roof_new_offset_run").attr("readonly", !1) : ($("#roof_new_offset_run").attr("readonly", !0), $("#roof_new_offset_run").val(0));
                        break;
                    default:
                }
                break;
            case "roof_new_nomenclature_change_mch_edited_shal_calc_mode":
                SimpleCad.Action({
                    type: "roof_new_nomenclature_change_2"
                }), Fr();
                break;
            case "roof_new_nomenclature_change_edit_shal":
                "none" == $("#roof_new_find_nomenclature_btn").css("display") && $("#roof_new_form_set_settings").show(), _.length = parseInt(_.length);
                var r = $("#sheet_allowed_length_text_edit_cells").find("[data-l=\"" + _.length + "\"]"),
                    G = [],
                    N = "";
                switch ($("#roof_new_mode").val()) {
                    case "new":
                        G = Ho.sheet_allowed_length_full, N = Ho.type;
                        break;
                    case "settings":
                        "undefined" == typeof Ho.nom_id_1c ? (G = Mo.sheet_allowed_length_full, N = Mo.type) : (G = Ho.sheet_allowed_length_full, N = Ho.type);
                        break;
                    default:
                } - 1 !== $.inArray(_.length, G) && r.toggleClass("selected"), "mch" == N && 0 < $("#sheet_allowed_length_text_edit_cells").find(".selected").length ? $("#roof_new_mch_edited_shal_calc_mode").show() : $("#roof_new_mch_edited_shal_calc_mode").hide(), Fr();
                break;
            case "roof_columns_sheet_btn":
                B_(_);
                break;
            case "roof_params_change":
                E_(_);
                break;
            case "pagination":
                Aa(_);
                break;
            case "roof_new_find_nomenclature":
                It("roof_new_form");
                break;
            case "roof_data_params_add_no_backend_data":
                "block" == $("#roof_new_type_reassign").css("display") && (Mo.type = $("#roof_new_type_reassign").val()), Mo.gap_y = parseInt(U($("#roof_new_gap_y").val())), Mo.sheet_width_useful = parseInt($("#roof_new_sheet_width_useful").val()), Mo.gap_x = Mo.sheet_width - Mo.sheet_width_useful, Mo.sheet_allowed_length_rounding = parseInt($("#roof_new_sheet_allowed_length_rounding").val()), Mo.offset_run = parseInt(U($("#roof_new_offset_run").val())), Mo.chess_offset = parseInt($("#roof_new_chess_offset").val()), Mo.sheet_allowed_length_correct_min = parseInt($("#roof_new_sheet_allowed_length_correct_min").val()), Mo.sheet_allowed_length_correct_max = parseInt($("#roof_new_sheet_allowed_length_correct_max").val()), Mo.mch_edited_shal_calc_mode = $("#roof_new_mch_edited_shal_calc_mode").find("input[name=\"roof_new_mch_edited_shal_calc_mode\"]:checked").val();
                var E = [],
                    M = $("#sheet_allowed_length_text_edit_cells").find(".selected");
                0 < M.length && $.each(M, function(e, t) {
                    E.push(parseInt($(t)[0].attributes["data-l"].value))
                }), Mo.sheet_allowed_length_edit = JSON.stringify(E), Mo.sheet_allowed_length = [], $.each(Mo.sheet_allowed_length_full, function(e, t) {
                    0 == t % Mo.sheet_allowed_length_rounding && t >= Mo.sheet_allowed_length_correct_min && t <= Mo.sheet_allowed_length_correct_max && (0 < E.length ? -1 !== $.inArray(t, E) && Mo.sheet_allowed_length.push(t) : Mo.sheet_allowed_length.push(t))
                }), Mo.sheet_max_length_tech = Mo.sheet_allowed_length[Mo.sheet_allowed_length.length - 1], Mo.sheet_min_length_tech = Mo.sheet_allowed_length[0];
                break;
            case "roof_data_params_add_no_backend_data_update_gap_y":
                if ("mch" == Mo.type && (Mo.gap_y = Mo.gap_y_ish, "[]" != Mo.sheet_allowed_length_edit && "warehouse_whole" == Mo.mch_edited_shal_calc_mode)) {
                    for (var J = [], Q = 0, ee = 1; 100 > ee; ee++) Q = ee * Mo.wave_length + Mo.gap_y, Q >= Mo.sheet_min_length_tech && Q <= Mo.sheet_max_length_tech && -1 !== $.inArray(Q, Mo.sheet_allowed_length) && J.push(Q), Q > Mo.sheet_max_length_tech && (ee = 101);
                    if (0 == J.length) {
                        var te = Mo.sheet_allowed_length[0],
                            ae = 0;
                        Q = 0;
                        for (var ee = 1; 100 > ee; ee++) Q = ee * Mo.wave_length + Mo.gap_y, Q <= te ? ae = Q : ee = 101;
                        0 < ae && (Mo.gap_y = te - ae + Mo.gap_y)
                    }
                }
                break;
            case "roof_data_params_add_no_backend_data_update_sheet_max_length_list_update_select":
                switch (Mo.type) {
                    case "mch":
                        Mo.sheet_max_length_list = [];
                        for (var Q = 0, ee = 1; 100 > ee; ee++) Q = ee * Mo.wave_length + Mo.gap_y, Q >= Mo.sheet_min_length_tech && Q <= Mo.sheet_max_length_tech && -1 !== $.inArray(Q, Mo.sheet_allowed_length) && Mo.sheet_max_length_list.push(Q), Q > Mo.sheet_max_length_tech && (ee = 101);
                        var re = "";
                        $.each(Mo.sheet_max_length_list, function(e, t) {
                            re += "<option value=\"" + t + "\">" + (t / 1e3).toFixed(2) + "</option>"
                        }), $("#roof_param_sheet_max_length_select").html(re);
                        var ne = 4e3,
                            ie = 0,
                            le = 0;
                        $.each(Mo.sheet_max_length_list, function(e, t) {
                            return t > ne ? (le = ie, !1) : void(ie = t)
                        }), 0 == le && (le = ie), $.each(Mo.sheet_max_length, function(e, t) {
                            -1 === $.inArray(t, Mo.sheet_max_length_list) && (Mo.sheet_max_length[e] = le)
                        });
                        break;
                    case "mch_modul":
                        $.each(Mo.sheet_max_length, function(e) {
                            Mo.sheet_max_length[e] = Mo.sheet_allowed_length[0]
                        });
                        break;
                    case "pn":
                    case "falc":
                        var ne = 4e3;
                        "falc" == Mo.type && (ne = 9e3);
                        var ie = 0,
                            le = 0;
                        $.each(Mo.sheet_allowed_length, function(e, t) {
                            return t > ne ? (le = ie, !1) : void(ie = t)
                        }), 0 == le && (le = ie), $.each(Mo.sheet_max_length, function(e, t) {
                            -1 === $.inArray(t, Mo.sheet_allowed_length) && (Mo.sheet_max_length[e] = le)
                        });
                        break;
                    case "siding":
                    case "siding_vert":
                        var de = Mo.sheet_allowed_length[Mo.sheet_allowed_length.length - 1];
                        $.each(Mo.sheet_max_length, function(e) {
                            Mo.sheet_max_length[e] = de
                        });
                        break;
                    default:
                }
                break;
            case "roof_data_params_add_no_backend_data_update_warehouse_calc_vars":
                "[]" != Mo.sheet_allowed_length_edit && (-1 !== $.inArray(Mo.type, ["siding", "siding_vert"]) || "mch" == Mo.type && "warehouse_cutted_schemed" == Mo.mch_edited_shal_calc_mode) && (Mo.sheet_allowed_length = [], $.each(Mo.sheet_allowed_length_full, function(e, t) {
                    0 == t % Mo.sheet_allowed_length_rounding && t >= Mo.sheet_allowed_length_correct_min && t <= Mo.sheet_allowed_length_correct_max && t <= Mo.sheet_max_length_tech && Mo.sheet_allowed_length.push(t)
                }), Mo.sheet_min_length_tech = Mo.sheet_allowed_length[0]);
                break;
            case "roof_new_create":
                if (Gt({
                        type: Ho.type
                    }), Wt("roof_new_form", ""), 0 < ai.errors.length) return;
                Gn(), p(), Mo = JSON.parse(JSON.stringify(Ho)), Ho = {}, initializeCadBlock(ei), SimpleCad.Action({
                    type: "roof_data_params_add_no_backend_data"
                }), SimpleCad.Action({
                    type: "roof_data_params_add_no_backend_data_update_gap_y"
                }), SimpleCad.Action({
                    type: "roof_data_params_add_no_backend_data_update_warehouse_calc_vars"
                }), SimpleCad.Action({
                    type: "roof_data_params_add_no_backend_data_update_sheet_max_length_list_update_select"
                }), ti.id = 0, ti.name = $("#roof_new_name").val(), ti.type = "roof", An({
                    mode: "graph"
                }), $("#roof_welcome").hide(), La(), $("#modal_html").modal("hide"), ca(), sl.find(".sheet_btn").hide(), sl.find(".sheet_btn_" + Mo.type).show();
                var pe = ti.name.replace("[[", "").replace("]]", "");
                $("#r_d_nav_bot_file").html("<b>id:</b> " + ti.id + "&nbsp;&nbsp; <b>\u0424\u0430\u0439\u043B:</b> " + pe), qn();
                break;
            case "roof_settings_apply":
                var me = "";
                if (me = "undefined" == typeof Ho.nom_id_1c ? Mo.type : Ho.type, "block" == $("#roof_new_type_reassign").css("display") && (me = $("#roof_new_type_reassign").val()), Gt({
                        type: me
                    }), Wt("roof_new_form", ""), 0 < ai.errors.length) return;
                ti.name = $("#roof_new_name").val();
                var pe = ti.name.replace("[[", "").replace("]]", "");
                $("#r_d_nav_bot_file").html("<b>id:</b> " + ti.id + "&nbsp;&nbsp; <b>\u0424\u0430\u0439\u043B:</b> " + pe), 0 < $("#roof_files_in_nav > ul > li:nth-child(2) > a").length && 0 < ti.id && $("#roof_files_in_nav > ul > li:nth-child(2) > a").html(pe);
                var he = {
                        type: Mo.type,
                        gap_y: Mo.gap_y,
                        mch_edited_shal_calc_mode: Mo.mch_edited_shal_calc_mode,
                        sheet_width_useful: Mo.sheet_width_useful,
                        sheet_allowed_length_rounding: Mo.sheet_allowed_length_rounding,
                        offset_run: Mo.offset_run,
                        chess_offset: Mo.chess_offset,
                        sheet_allowed_length_correct_min: Mo.sheet_allowed_length_correct_min,
                        sheet_allowed_length_correct_max: Mo.sheet_allowed_length_correct_max,
                        sheet_allowed_length_edit: Mo.sheet_allowed_length_edit
                    },
                    ue = !1,
                    ge = !1;
                "undefined" != typeof Ho.nom_id_1c && (Mo = JSON.parse(JSON.stringify(Ho)), Ho = {}, ue = !0, ge = !0), SimpleCad.Action({
                    type: "roof_data_params_add_no_backend_data"
                }), SimpleCad.Action({
                    type: "roof_data_params_add_no_backend_data_update_gap_y"
                }), SimpleCad.Action({
                    type: "roof_data_params_add_no_backend_data_update_warehouse_calc_vars"
                }), SimpleCad.Action({
                    type: "roof_data_params_add_no_backend_data_update_sheet_max_length_list_update_select"
                }), $.each(he, function(e) {
                    he[e] != Mo[e] && (ue = !0)
                }), ue && ($.each(Mo.tabs_re_roof, function(e) {
                    "default" != e && (Mo.tabs_re_roof[e] = 1)
                }), ca(), Fa(), Ai = !1, q_(), La(), An({
                    mode: "clear"
                }), An({
                    mode: "graph"
                })), ge && Oa(), $("#modal_html").modal("hide");
                break;
            case "roof_calc":
                Us && (!Vo && SimpleCad.Action({
                    type: "cad_toggle_show_columns_sheets"
                }), q_());
                break;
            case "roof_save":
                "" == Gs.uid ? !$("#nav_li_file_save").hasClass("disabled") && ("undefined" == typeof _.is_restart_autosave && (_.is_restart_autosave = !0), T_(_.is_restart_autosave)) : SimpleCad.Action({
                    type: "ModalShow",
                    target: "roof_save_as_modal"
                });
                break;
            case "roof_save_as":
                It("roof_save_as_form");
                break;
            case "roof_load":
                P_(_);
                break;
            case "roof_link":
                Tn("clipboard_roof_link", Xs + "?uid=" + _.uid), Yn({
                    text: "\u0421\u0441\u044B\u043B\u043A\u0430 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0430",
                    type: "success"
                });
                break;
            case "roof_remove_question":
                var r = _.thisObject;
                $(".js_roof_remove_submit").hide(), $(".js_roof_remove_question").show(), r.hide(), r.parent().find(".js_roof_remove_submit").show(), null !== Co.roof_remove_question && clearTimeout(Co.roof_remove_question), Co.roof_remove_question = setTimeout(function() {
                    SimpleCad.Action({
                        type: "roof_remove_default"
                    })
                }, 5e3);
                break;
            case "roof_remove":
                var r = _.thisObject,
                    re = "<img src=\"" + Ys + "online/bloueloading.gif\" >";
                r.parent().html(re), K(_.type, {
                    id: _.id
                });
                break;
            case "roof_remove_default":
                $(".js_roof_remove_submit").hide(), $(".js_roof_remove_question").show();
                break;
            case "add_lineblock_lineblock_type_change":
                w_(_);
                break;
            case "scale_auto":
                v_();
                break;
            case "size_draw_element_highlight_pline_otrez":
                m_(_.parent_id, _.line_num_counter), L_({
                    pline_id: _.parent_id,
                    line_num_counter: _.line_num_counter
                });
                break;
            case "object_table_props_input_blur":
                p_(_.thisObject);
                break;
            case "object_table_props_input_focus":
                d_(_.thisObject);
                break;
            case "finish_cad_draw":
                handleKeyPress(27);
                break;
            case "finish_cad_draw_close":
                handleKeyPress(13);
                break;
            case "ModalSuccess":
                V();
                break;
            case "ModalShow":
                showModalWindow(_.target, {});
                break;
            case "SheetSubmenu":
                y(_.thisObject);
                break;
            case "SheetClick":
                g(_.thisObject);
                break;
            case "SheetAdd":
                var ye = !0;
                "undefined" != typeof _.history && (ye = _.history), configureLayerSettings({
                    type: _.target,
                    is_RoofSetCurrentLayerNameParams: !0,
                    history: ye
                });
                break;
            case "LineBlockValidate":
                It("modal_lineblock_form");
                break;
            case "ObjectTablePropsInputChange":
                R(_.thisObject);
                break;
            case "ObjectTablePropsInputChangeCancel":
                H();
                break;
            case "ObjectTablePropsInputChangeKeyup":
                Z(_.eventObject, _.thisObject);
                break;
            case "ObjectTablePropsInputChangeSubmit":
                B(_.thisObject);
                break;
            case "LineBlockValidatedSuccess":
                qt(_.form_inputs, _.response_data);
                break;
            case "FormZeroAllInputs":
                Zt(_.target);
                break;
            case "Element_Click_OnObjectLayer_Vsisble":
                F(_.thisObject);
                break;
            case "Element_Click_OnObjectLayer":
                C(_.thisObject);
                break;
            case "select_change":
                SelectChange(_);
                break;
            case "de_bug":
                o_();
                break;
            case "trash":
                switch (ei.type) {
                    case "sznde":
                        "undefined" != typeof Zi && "undefined" !== Zi || gs();
                        break;
                    case "roof":
                        "" != zi && T(zi, {
                            is_move_show: !1
                        });
                        break;
                    default:
                }
                if ("undefined" != typeof Zi && "undefined" !== Zi && !1 == Uo) {
                    "undefined" == typeof _.is_history && (_.is_history = !0);
                    var be = Zi.id(),
                        ve = be.substr(0, be.indexOf("__")),
                        xe = "";
                    "pline" == ve && _.is_history && "roof" == ei.type && (di = {
                        type: "h_trash_pline",
                        need_layer_num: yo,
                        need_tab_scale: Go.g_scale[vo],
                        need_axis: {
                            g_x: Fo[vo],
                            g_y: Ao[vo],
                            current_layer_name: vo
                        },
                        pline_data: {
                            id: Zi.attrs.id,
                            name: Zi.attrs.name,
                            points: JSON.copy(Zi.attrs.points),
                            offset_origin: JSON.copy(Zi.attrs.offset_origin),
                            columns_sheets: "undefined" == typeof Zi.attrs.columns_sheets ? [] : JSON.copy(Zi.attrs.columns_sheets),
                            is_offset_origin_add: !1
                        }
                    }, An({
                        mode: "add",
                        element: di
                    })), "lineblock" == ve && (xe = Zi.attrs.parent_id), ("pline" == ve || "line" == ve) && q(Zi.id()), "pline" == ve && removeChildElementsByParentId(Zi.id()), "pline" == ve && -1 !== $.inArray(ei.type, ["roof", "sznde"]) && $_(Zi.id()), resetActiveElement(), "" != xe && (processElementById(xe), to[vo].draw()), k_(), "pline" == ve && "roof" == ei.type && da(), C_(), "" != zi && kl.hide(), zi = "", "pline" == ve && "sznde" == ei.type && ys()
                } else switch (ei.type) {
                    case "sznde":
                        Yn({
                            text: "\u042D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E",
                            type: "error"
                        });
                        break;
                    case "roof":
                        SimpleCad.Action({
                            type: "ModalShow",
                            target: "trash_btn_click_error"
                        });
                        break;
                    default:
                }
                break;
            case "scale":
                Ke(_.param, "", !0, !0);
                break;
            case "save":
                $("#nav_li_file_image").hasClass("disabled") || ft();
                break;
            case "save_as_template":
                Ls();
                break;
            case "nde_as_modal_cropped_image":
                js();
                break;
            case "figures_add_doborn":
                var we = _s(_.pline_params);
                if (we) {
                    var ke = as(_.pline_params),
                        ze = createPolyline(ke);
                    oa(ze), v_(), Fs(_.pline_params), _n(ze.id(), {
                        mode: "lengths_all",
                        lengths: _.pline_params.lengths
                    }), rs(ze), fs(ze), updateElementParametersDisplay(ze), 0 < Object.keys(ze.attrs.pline_breaks).length ? v_() : refreshCurrentLayer(), $("#modal_html").modal("hide")
                } else alert("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u043F\u043E\u043B\u0438\u043B\u0438\u043D\u0438\u0438!");
                break;
            case "modal_paste_figure_img":
                var je = _.target.replace("target_", ""),
                    Ce = $("#figures_all_img_ver").val();
                $("#" + _.target + "_big").attr("src", Ts + "theme/image/figures/" + je + "/" + je + ".png?v" + Ce), $(".figures_footer_hidden").show(), $(".one_figure_form").removeClass("active"), $("#" + _.target).addClass("active"), $("#figures_all").hide(), $("#figures_all_forms").show();
                break;
            case "modal_paste_figure_back_to_all_fig":
                $(".figures_footer_hidden").hide(), $("#figures_all_forms").hide(), $("#figures_all").show();
                break;
            case "modal_paste_figure_zero":
                var Le = yi.length.str;
                1 == Wo.settings_programm_figures_razmer.is_use_razmer_template && (Le = Wo.settings_programm_figures_razmer.razmer_template), $("#" + _.target).find("input[type=\"text\"]").val(Le).prop("disabled", !1).prop("readonly", !1), Xt(_.target), $("#" + _.target).find(".input_always_disabled").prop("disabled", !0).prop("readonly", !0);
                var Oe = _.target.replace("form", "");
                $("#" + Oe + "offset_axes").prop("checked", !0), $("#" + Oe + "offset_x").prop("disabled", !0).prop("readonly", !0), $("#" + Oe + "offset_y").prop("disabled", !0).prop("readonly", !0);
                break;
            case "modal_paste_figure_input_focus":
                var Ce = $("#figures_all_img_ver").val(),
                    Fe = _.thisObject[0].attributes.id.value,
                    Ae = Fe.replace("target_", "");
                $("#target_" + _.figure + "_big").attr("src", Ts + "theme/image/figures/" + _.figure + "/" + Ae + ".png?v" + Ce), _.thisObject.select();
                break;
            case "modal_paste_figure_input_focus_delta":
                _.thisObject.select();
                break;
            case "modal_paste_figure_input_blur":
                var Ce = $("#figures_all_img_ver").val();
                $("#target_" + _.figure + "_big").attr("src", Ts + "theme/image/figures/" + _.figure + "/" + _.figure + ".png?v" + Ce), aa(_.thisObject, _.mode);
                break;
            case "modal_paste_figure_input_blur_delta":
                aa(_.thisObject, _.mode);
                break;
            case "modal_paste_figure_validate_and_paste":
                sa();
                break;
            case "modal_paste_figure_offset_axes_checkbox_change":
                var r = _.thisObject,
                    qe = $("#figures_all_forms").find(".one_figure_form.active form"),
                    Te = qe[0].id,
                    Oe = Te.replace("form", "");
                r.prop("checked") ? ($("#" + Oe + "offset_x").prop("disabled", !0).prop("readonly", !0), $("#" + Oe + "offset_y").prop("disabled", !0).prop("readonly", !0)) : ($("#" + Oe + "offset_x").prop("disabled", !1).prop("readonly", !1), $("#" + Oe + "offset_y").prop("disabled", !1).prop("readonly", !1));
                break;
            case "trigonom_figure_zero":
                switch (On(150), $("#" + _.target).find("input[type=\"text\"]").val("").prop("disabled", !1).prop("readonly", !1), $("#trigonom_" + _.figure + "_s").html("0.000"), $("#trigonom_" + _.figure + "_p").html("0.000"), _.figure) {
                    case "triangle":
                        $("#trigonom_triangle_rectangular").prop("checked") ? ($("#trigonom_triangle_ga").prop("disabled", !0).prop("readonly", !0).val("90"), $("#trigonom_triangle_ga_proc").prop("disabled", !0).prop("readonly", !0).val("-"), $("#trigonom_triangle_ga_otn").prop("disabled", !0).prop("readonly", !0).val("-"), $("#trigonom_triangle_ga_ukl").prop("disabled", !0).prop("readonly", !0).val("-"), $("#trigonom_triangle_ga_kukl").prop("disabled", !0).prop("readonly", !0).val("-")) : ($("#trigonom_triangle_ga").prop("disabled", !1).prop("readonly", !1).val(""), $("#trigonom_triangle_ga_proc").prop("disabled", !1).prop("readonly", !1).val(""), $("#trigonom_triangle_ga_otn").prop("disabled", !1).prop("readonly", !1).val(""), $("#trigonom_triangle_ga_ukl").prop("disabled", !1).prop("readonly", !1).val(""), $("#trigonom_triangle_ga_kukl").prop("disabled", !1).prop("readonly", !1).val("")), SimpleCad.Action({
                            type: "trigonom_triangle_rectangular_chb_enable"
                        });
                        break;
                    default:
                }
                Xt(_.target);
                break;
            case "trigonom_triangle_rectangular_chb_enable":
                $("#trigonom_triangle_rectangular").prop("disabled", !1).prop("readonly", !1), $("#trigonom_triangle_rectangular").parent().removeClass("filter_hor_one_disabled_chb");
                break;
            case "trigonom_triangle_rectangular_chb_disable":
                $("#trigonom_triangle_rectangular").prop("disabled", !0).prop("readonly", !0), $("#trigonom_triangle_rectangular").parent().addClass("filter_hor_one_disabled_chb");
                break;
            case "trigonom_figure_input_focus":
                var Ce = $("#trigonom_img_ver").val(),
                    Fe = _.thisObject[0].attributes.id.value,
                    Ae = Fe.replace("trigonom_", "");
                switch (_.figure) {
                    case "triangle":
                        $("#trigonom_triangle_rectangular").prop("checked") && (Ae = Ae.replace("triangle_", "triangle_rect_"));
                        break;
                    default:
                }
                $("#trigonom_" + _.figure + "_big").attr("src", Ts + "theme/image/trigonom/" + _.figure + "/" + Ae + ".png?v" + Ce);
                break;
            case "trigonom_figure_input_blur":
                var Ce = $("#trigonom_img_ver").val(),
                    Ae = _.figure,
                    r = _.thisObject;
                switch (_.figure) {
                    case "triangle":
                        $("#trigonom_triangle_rectangular").prop("checked") && (Ae += "_rect");
                        break;
                    default:
                }
                $("#trigonom_" + _.figure + "_big").attr("src", Ts + "theme/image/trigonom/" + _.figure + "/" + Ae + ".png?v" + Ce), xn(r, _.mode, _.figure), wn(r[0].attributes.id.value, _.figure), Cn();
                break;
            case "trigonom_figure_input_blur_other":
                var Se = _.thisObject[0].value + "",
                    Pe = Math.abs(U(Se)),
                    Ie = 0,
                    Fe = _.thisObject[0].attributes.id.value,
                    Ye = Fe.replace("trigonom_" + _.figure + "_", ""),
                    De = Ye.split("_");
                if (De = {
                        angle: De[0],
                        mode: De[1]
                    }, 0 < Pe) switch (De.mode) {
                    case "proc":
                        Ie = e_(Pe);
                        break;
                    case "otn":
                        Ie = __(Pe);
                        break;
                    case "ukl":
                        Ie = r_(Pe);
                        break;
                    case "kukl":
                        Ie = s_(Pe);
                        break;
                    default:
                }
                $("#trigonom_" + _.figure + "_" + De.angle).val(Ie), $("#trigonom_" + _.figure + "_" + De.angle).focus().blur();
                break;
            case "trigonom_figure_input_keyup":
                var m = _.eventObject.keyCode;
                13 == m && _.thisObject.focus().blur();
                break;
            case "trigonom_figure_table_modal_other_click":
                $("#trigonom_triangle_" + _.angle).prop("disabled") ? ($("#trigonom_triangle_" + _.angle).addClass("disabled_inp_highlight"), setTimeout(function() {
                    $("#trigonom_triangle_" + _.angle).removeClass("disabled_inp_highlight")
                }, 300)) : ($("#trigonom_other_table_modal_block").show(), $("#trigonom_main").hide(), $("#trigonom_other_table_angle").val(_.angle));
                break;
            case "trigonom_figure_table_modal_other_back":
                $("#trigonom_other_table_modal_block").hide(), $("#trigonom_main").show();
                break;
            case "calc_trigonom_modal_success":
                Ln();
                break;
            case "trigonom_figure_table_modal_row_click":
                var Xe = $("#trigonom_other_table_angle").val();
                _.angle = parseInt(_.angle), $("#trigonom_triangle_" + Xe).val(_.angle), $("#trigonom_other_table_modal_block").hide(), $("#trigonom_main").show(), $("#trigonom_triangle_" + Xe).focus().blur();
                break;
            case "trigonom_figure_triangle_rectangular_checkbox_change":
                if (!$("#trigonom_triangle_rectangular").parent().hasClass("filter_hor_one_disabled_chb")) {
                    On(150);
                    var Ce = $("#trigonom_img_ver").val(),
                        r = _.thisObject;
                    r.prop("checked") ? ($("#trigonom_triangle_ga").prop("disabled", !0).prop("readonly", !0).val("90"), $("#trigonom_triangle_big").attr("src", Ts + "theme/image/trigonom/triangle/triangle_rect.png?v" + Ce), $("#trigonom_triangle_ga_proc").prop("disabled", !0).prop("readonly", !0).val("-"), $("#trigonom_triangle_ga_otn").prop("disabled", !0).prop("readonly", !0).val("-"), $("#trigonom_triangle_ga_ukl").prop("disabled", !0).prop("readonly", !0).val("-"), $("#trigonom_triangle_ga_kukl").prop("disabled", !0).prop("readonly", !0).val("-")) : (!($("#trigonom_triangle_al").prop("disabled") && $("#trigonom_triangle_be").prop("disabled")) && ($("#trigonom_triangle_ga").prop("disabled", !1).prop("readonly", !1).val(""), $("#trigonom_triangle_ga_proc").prop("disabled", !1).prop("readonly", !1).val(""), $("#trigonom_triangle_ga_otn").prop("disabled", !1).prop("readonly", !1).val(""), $("#trigonom_triangle_ga_ukl").prop("disabled", !1).prop("readonly", !1).val(""), $("#trigonom_triangle_ga_kukl").prop("disabled", !1).prop("readonly", !1).val("")), $("#trigonom_triangle_big").attr("src", Ts + "theme/image/trigonom/triangle/triangle.png?v" + Ce)), wn("trigonom_triangle_ga", "triangle")
                }
                break;
            case "move_point_controller":
                er(_);
                break;
            case "figure_controller":
                Ua(_);
                break;
            case "figure_move_controller":
                Za(_);
                break;
            case "figure_paste_relatively_controller":
                Vn(_);
                break;
            case "admin_nomenclature_group_change_one":
                var r = _.thisObject,
                    Ge = r[0].value;
                K(_.type, {
                    id_1c: _.id_1c,
                    param: _.param,
                    value: Ge
                });
                break;
            case "nde_inp_focus":
                ss(_);
                break;
            case "nde_inp_blur":
                is(_);
                break;
            case "nde_inp_keyup":
                os(_);
                break;
            case "nde_radio_change":
                ls(_);
                break;
            case "nde_select_change":
                cs(_);
                break;
            case "nde_check":
                bs();
                break;
            case "nde_check_and_attach":
                xs();
                break;
            case "nde_template_remove":
                Os(_);
                break;
            default:
        }
    }, Math.dist = function(e, t, _, a) {
        return Math.sqrt((_ - e) * (_ - e) + (a - t) * (a - t))
    }, Math.angle = function(e, t, _, a, r, n, s, o) {
        var i = e - _,
            c = t - a,
            d = r - _,
            p = n - a,
            m = Math.sqrt(i * i + c * c),
            h = Math.sqrt(d * d + p * p),
            u = Math.acos((i * d + c * p) / (m * h));
        if (s && (u *= l["180/pi"]), o) {
            0 > i * p - c * d && (u *= -1)
        }
        return u
    }, Math.float_mult_to_int = function() {
        return res
    };
    var Fl = "",
        Al = "";
    this.GetElements = function(e) {
        return Ct(e)
    }, this.GetPlines = function() {
        return Ct({
            filter_type: ["pline"],
            filter_visible: "1"
        })
    };
    var ql = !0;
    this.Save = function(e) {
        ie();
        to[vo].toImage({
            callback: function(t) {
                if ("undefined" != typeof e.on_save_success_function) {
                    var _ = $(t)[0].attributes.src.value;
                    window[e.on_save_success_function](_)
                }
            }
        })
    };
    var Tl = "";
    JSON.copy = function(e) {
        return JSON.parse(JSON.stringify(e))
    }, JSON.DestroyKonva = function(e, t, _) {
        return 0 < Object.keys(e).length && $.each(e, function(e, a) {
            1 == t ? (_ && 0 < a.children.length && a.destroyChildren(), a.destroy(), a = null) : $.each(a, function(e, _) {
                2 == t && (_.destroy(), _ = null)
            })
        }), e = null, {}
    }, Math.round_precision = function(e, t) {
        var _ = Math.round(e / t) * t;
        return _
    }, Math.round_precision_nearest = function(e, t) {
        var _ = e;
        return 0 <= _ ? 0 < _ && (_ = Math.round_precision(_, t)) : _ = -1 * Math.round_precision(Math.abs(_), t), _
    }
}